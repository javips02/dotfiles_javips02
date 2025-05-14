import * as fileUtils from "astal/file";
import { Gtk } from "astal/gtk4";

async function getRamUsage(): Promise<number> {
  const data = await fileUtils.readFile("/proc/meminfo");
  const lines = data.split("\n");

  const memTotal = parseInt(lines.find(l => l.startsWith("MemTotal"))?.match(/\d+/)?.[0] || "0", 10);
  const memAvailable = parseInt(lines.find(l => l.startsWith("MemAvailable"))?.match(/\d+/)?.[0] || "0", 10);

  if (memTotal === 0) return 0;

  const used = memTotal - memAvailable;
  return Math.round((used / memTotal) * 100);
}

async function getCpuUsage(): Promise<number> {
    const data = await fileUtils.readFile("/proc/stat");
    const lines = data.split("\n");
    const cpuLine = lines[0];
    const values = cpuLine.split(/\s+/).slice(1, 8).map(Number);
    
    const idle = values[3];
    const total = values.reduce((a, b) => a + b);
    
    // Store current values for next calculation
    getCpuUsage.lastIdle = getCpuUsage.lastIdle || idle;
    getCpuUsage.lastTotal = getCpuUsage.lastTotal || total;
    
    // Calculate delta
    const deltaIdle = idle - getCpuUsage.lastIdle;
    const deltaTotal = total - getCpuUsage.lastTotal;
    
    // Update stored values
    getCpuUsage.lastIdle = idle;
    getCpuUsage.lastTotal = total;
    
    return Math.round(100 * (1 - deltaIdle / deltaTotal));
}
getCpuUsage.lastIdle = 0;
getCpuUsage.lastTotal = 0;

export function Ram_icon() {
    // Create widgets
    const button = Gtk.Button.new();
    const box = Gtk.Box.new(Gtk.Orientation.HORIZONTAL, 6);
    const image = Gtk.Image.new_from_icon_name("memory-symbolic");
    const label = Gtk.Label.new("Loading...");

    box.append(image);
    box.append(label);
    button.set_child(box);

    // Update RAM usage display
    const updateRamLabel = async () => {
        const usage = await getRamUsage();
        label.set_label(`${usage}%`);
    }

    // Initial update
    updateRamLabel();

    // Update every 5 seconds
    setInterval(updateRamLabel, 5000);

    // Click handler
    button.connect("clicked", updateRamLabel);

    return button;
}

export function Cpu_icon() {
    const button = Gtk.Button.new();
    const box = Gtk.Box.new(Gtk.Orientation.HORIZONTAL, 6);
    const image = Gtk.Image.new_from_icon_name("cpu-symbolic");
    const label = Gtk.Label.new("Loading...");

    box.append(image);
    box.append(label);
    button.set_child(box);

    const updateCpuLabel = async () => {
        const usage = await getCpuUsage();
        label.set_label(`${usage}%`);
    }

    updateCpuLabel();
    setInterval(updateCpuLabel, 2000);

    button.connect("clicked", updateCpuLabel);

    return button;
}

