import os
from pathlib import Path
import shutil
import subprocess
import tempfile
import unittest


REPO = Path(__file__).resolve().parents[1]


class KittySetupTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.home = self.root / "home with spaces"
        self.home.mkdir()
        self.bin = self.root / "bin"
        self.bin.mkdir()
        self.repo = self.root / "repo"
        self.repo.mkdir()
        shutil.copy2(REPO / "kitty-setup.sh", self.repo)
        icons = self.repo / "terminal/.config/kitty"
        icons.mkdir(parents=True)
        for name in ("kitty.app.icns", "kitty.app.png"):
            shutil.copy2(REPO / "terminal/.config/kitty" / name, icons)
        self.env = {
            "PATH": f"{self.bin}:/usr/bin:/bin",
            "HOME": str(self.home),
            "XDG_CONFIG_HOME": str(self.home / "custom config"),
            "XDG_DATA_HOME": str(self.home / "custom data"),
        }
        self.command("uname", "echo Linux")
        self.command("kitty", "echo 'kitty test'")
        self.command("update-desktop-database", "exit 0")

    def command(self, name, body):
        path = self.bin / name
        path.write_text(f"#!/bin/sh\nset -eu\n{body}\n")
        path.chmod(0o755)
        return path

    def run_setup(self, platform="linux", success=True):
        result = subprocess.run(
            ["bash", str(self.repo / "kitty-setup.sh"), platform],
            env=self.env,
            text=True,
            capture_output=True,
        )
        if success:
            self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        else:
            self.assertNotEqual(result.returncode, 0)
        return result

    @property
    def config(self):
        return Path(self.env["XDG_CONFIG_HOME"]) / "kitty"

    @property
    def desktop(self):
        return Path(self.env["XDG_DATA_HOME"]) / "applications/kitty.desktop"

    def test_installed_kitty_icons_launcher_backups_and_idempotence(self):
        self.config.mkdir(parents=True)
        old_icon = self.config / "kitty.app.png"
        old_icon.write_text("old icon")
        self.desktop.parent.mkdir(parents=True)
        original = (
            "[Desktop Entry]\nName=My kitty\nExec=kitty --single-instance\n"
            "Icon=old\n[Desktop Action new]\nExec=kitty --detach\nIcon=action\n"
        )
        self.desktop.write_text(original)
        self.run_setup()
        self.assertTrue(old_icon.is_symlink())
        self.assertEqual(
            list(self.config.glob("kitty.app.png.backup.*"))[0].read_text(),
            "old icon",
        )
        launcher = self.desktop.read_text()
        self.assertIn(f"Icon={old_icon}\n", launcher)
        self.assertIn("Exec=kitty --single-instance\n", launcher)
        self.assertIn("Icon=action\n", launcher)
        self.assertEqual(
            list(self.desktop.parent.glob("kitty.desktop.backup.*"))[0].read_text(),
            original,
        )
        self.run_setup()
        self.assertEqual(len(list(self.config.glob("*.backup.*"))), 1)
        self.assertEqual(len(list(self.desktop.parent.glob("*.backup.*"))), 1)

    def test_user_local_install_and_launcher_without_icon(self):
        (self.bin / "kitty").unlink()
        local_bin = self.home / ".local/kitty.app/bin/kitty"
        local_bin.parent.mkdir(parents=True)
        local_bin.write_text("#!/bin/sh\necho 'kitty local'\n")
        local_bin.chmod(0o755)
        self.desktop.parent.mkdir(parents=True)
        self.desktop.write_text("[Desktop Entry]\nExec=kitty --single-instance\n")
        self.run_setup()
        launcher = self.desktop.read_text()
        self.assertIn(f'Exec="{local_bin}" --single-instance\n', launcher)
        self.assertIn(f"Icon={self.config}/kitty.app.png\n", launcher)
        self.run_setup()
        self.assertEqual(len(list(self.desktop.parent.glob("*.backup.*"))), 1)

    def test_package_install_and_failure_propagation(self):
        kitty = self.bin / "kitty"
        kitty.rename(self.bin / "kitty-to-install")
        self.command("id", "echo 1000")
        self.command("sudo", 'exec "$@"')
        log = self.root / "install.log"
        self.command(
            "apt-get",
            f'echo "$*" >> "{log}"\n'
            'if [ "$1" = install ]; then\n'
            f'  cp "{self.bin}/kitty-to-install" "{kitty}"\n'
            "fi",
        )
        self.run_setup()
        self.assertEqual(log.read_text(), "update\ninstall -y kitty\n")
        self.assertTrue(self.desktop.is_file())
        kitty.unlink()
        self.command("apt-get", "exit 42")
        result = self.run_setup(success=False)
        self.assertEqual(result.returncode, 42)

    def test_explicit_config_directory_and_wrong_platform(self):
        self.env["KITTY_CONFIG_DIRECTORY"] = str(self.home / "kitty override")
        self.run_setup()
        self.assertTrue(
            (Path(self.env["KITTY_CONFIG_DIRECTORY"]) / "kitty.app.icns").is_symlink()
        )
        self.assertFalse(self.config.exists())
        result = self.run_setup(platform="macos", success=False)
        self.assertIn("match the current operating system", result.stderr)


if __name__ == "__main__":
    unittest.main()
