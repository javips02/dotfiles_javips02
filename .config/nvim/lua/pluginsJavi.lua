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
  	{
		'loctvl842/monokai-pro.nvim',
		dependencies = { 'nvim-tree/nvim-web-devicons' },
		config = function()
			require("monokai-pro").setup({
				transparent_background = true,
				terminal_colors = true,
				devicons = false, -- highlight the icons of `nvim-web-devicons`
				filter = "pro", -- classic | octagon | pro | machine | ristretto | spectrum
				plugins = {
				  bufferline = {
					underline_selected = false,
					underline_visible = false,
				  },
				  indent_blankline = {
					context_highlight = "default", -- default | pro
					context_start_underline = false,
				  },
				},
			  })
			  -- lua
			  vim.cmd([[colorscheme monokai-pro]])
		end,
	},
	{
    	'nvim-lualine/lualine.nvim',
    	dependencies = { 'nvim-tree/nvim-web-devicons' },
		config = function()
			require('lualine').setup ({
				options = {
				icons_enabled = true,
				theme = 'auto',
				component_separators = { left = '', right = ''},
				section_separators = { left = '', right = ''},
				disabled_filetypes = {
					statusline = {},
					winbar = {},
				},
				ignore_focus = {},
				always_divide_middle = true,
				globalstatus = false,
				refresh = {
					statusline = 1000,
					tabline = 1000,
					winbar = 1000,
				}
				},
				sections = {
				lualine_a = {'mode'},
				lualine_b = {'branch', 'diff', 'diagnostics'},
				lualine_c = {'filename'},
				lualine_x = {'encoding', 'fileformat', 'filetype'},
				lualine_y = {'progress'},
				lualine_z = {'location'}
				},
				inactive_sections = {
				lualine_a = {},
				lualine_b = {},
				lualine_c = {'filename'},
				lualine_x = {'location'},
				lualine_y = {},
				lualine_z = {}
				},
				tabline = {},
				winbar = {},
				inactive_winbar = {},
				extensions = {}
			})
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
