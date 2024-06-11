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
			require('kanagawa').setup({
				transparent = true,  -- set background color to transparent
			})
			vim.cmd.colorscheme("kanagawa-wave")
		end,
	},
	{   -- Treesitter (parsers)
		"nvim-treesitter/nvim-treesitter",
		config = function()
			require("nvim-treesitter.configs").setup({
				-- First 5 crucial to have
				ensure_installed = { "c", "lua", "vim", "vimdoc", "query" },

				auto_install = true, -- si entras en un fichero y no tienes su parser, se instala auto.

				highlight = {
					enable = true,
				},
				incremental_selection = {
					-- para seleccionar texto en funcion del texto
					enable = true,
					keymaps = {
						init_selection = "<Leader>ss", -- selection start
						node_incremental = "<Leader>si", -- selection increment
						scope_incremental = "<Leader>sc", -- select scope 
						node_decremental = "<Leader>sd", -- decrease selection
					},
				},
				textobjects = { -- para mejorar la comprensión de contextos de treesitter al seleccionar
					select = {
						enable = true,
						lookahead = true, -- mueve el cursor a la siguiente función si la borras
						keymaps = { -- mirar grupos en el archivo textobjects.scm
							["af"] = "@function.outer",
							["if"] = "@function.inner",
							["ac"] = "@class.outer",
							["ic"] = { query = "@class.inner", desc = "Select inner part of a class region" },
							["as"] = { query = "@scope", query_group = "locals", desc = "Select language scope" },
						},
						selection_modes = {
							['@parameter.outer'] = 'v', -- charwise
							['@function.outer'] = 'V', -- linewise
							['@class.outer'] = '<c-v>', -- blockwise
						},
						include_surrounding_whitespace = true,
					},
				},
			})
		end,
	},
	{
		"nvim-treesitter/nvim-treesitter-textobjects",

	},
})
