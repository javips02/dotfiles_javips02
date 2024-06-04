-- Gestor de plugins lazy --
-- ---------------------- --
-- Bootstrap (nunca uses variables globales en lua LOCAL súper importante por seguridad y rendimiento)
-- explicación detallada en apuntes de vim para toda esta instalación
local lazypath = vim.fn.stdpath("data") .. "/lazy/lazy.nvim"  -- coge dir de datos (~/.local/share normalmente) y crea un dir para nvim donde meteremos los plugins instalados
if not (vim.uv or vim.loop).fs_stat(lazypath) then
  vim.fn.system({
    "git",
    "clone",
    "--filter=blob:none",
    "https://github.com/folke/lazy.nvim.git",
    "--branch=stable", -- latest stable release
    lazypath,
  })
end
vim.opt.rtp:prepend(lazypath)

-- inicializamos plugins de lazy
require("lazy").setup({
	{   -- Colorscheme
		"rebelot/kanagawa.nvim",
		config = function()
			vim.cmd.colorscheme("kanagawa-wave")
		end,
	},
	{   -- Treesitter (parsers)
		"nvim-treesitter/nvim-treesitter",
		config = function()
			require("nvim-treesitter.configs").setup({
				-- First 5 crucial to have
				ensure_installed = { "c", "lua", "vim", "vimdoc", "query", "java", "bash", "dart", "json" },

				auto_install = true,

				highlight = {
					enable = true,
				},
			})
		end,
	},
})
