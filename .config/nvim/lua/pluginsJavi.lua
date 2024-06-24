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
				auto_install = true, -- Automatically install missing parsers when entering buffer
				highlight = {
					enable = true,
					additional_vim_regex_highlighting = false,
				},

				incremental_selection = {
					enable = true,
					keymaps = {
						init_selection = "<Leader>ss", -- selection start
						node_incremental = "<Leader>si", -- selection increment
						scope_incremental = "<Leader>sc", -- select scope
						node_decremental = "<Leader>sd", -- decrease selection
					},
				},

				textobjects = {
					select = {
						enable = true,
						lookahead = true, -- Automatically jump forward to textobj, similar to targets.vim
						keymaps = {
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
	{ -- telscope: para fuzzyfinding de archivos TODO: revisar fxf-native para nvim para mejor rendimiento con el fuzzyfinding
		'nvim-telescope/telescope.nvim',
		dependencies = {'nvim-lua/plenary.nvim', {"nvim-telescope/telescope-fzf-native.nvim", build = "make" }, 'nvim-tree/nvim-web-devicons'},
		config = function()
			local telescope = require('telescope')
			local actions = require('telescope.actions')
			require('telescope').setup{
				defaults = {
					-- Default configuration for telescope goes here:
					-- config_key = value,
					mappings = {
						i = {
							-- map actions.which_key to <C-h> (default: <C-/>)
							-- actions.which_key shows the mappings for your picker,
							-- e.g. git_{create, delete, ...}_branch for the git_branches picker
							["<C-h>"] = "which_key"
						}
					}
				},
				extensions = {}
			}
			
			-- Configurar keybindings para usar Telescope
			local keymap = vim.api.nvim_set_keymap
			local opts = { noremap = true, silent = true }

			-- Keybindings para diferentes funcionalidades de Telescope
			keymap('n', '<leader>ff', '<cmd>Telescope find_files<CR>', opts)
			keymap('n', '<leader>fg', '<cmd>Telescope live_grep<CR>', opts)
			keymap('n', '<leader>fb', '<cmd>Telescope buffers<CR>', opts)
			keymap('n', '<leader>fh', '<cmd>Telescope help_tags<CR>', opts)
		end,
	},
	{
		'lewis6991/gitsigns.nvim',
		config = function()
			require('gitsigns').setup()
		end,
	},
	{ --cmp: for auto completions
		'hrsh7th/nvim-cmp',
		event = 'InsertEnter',
		dependencies = {
			'hrsh7th/cmp-buffer',         -- Fuente para texto en el buffer
			'hrsh7th/cmp-path',           -- Fuente para rutas del sistema de archivos
			{ 'L3MON4D3/LuaSnip',         -- Motor de snippets
			build = 'make install_jsregexp' },
			'saadparwaiz1/cmp_luasnip',   -- Extensión para integrar Luasnip con cmp
			'rafamadriz/friendly-snippets', -- Snippets útiles
			'onsails/lspkind.nvim',       -- Iconos tipo VS Code en el menú de autocompletado
		},
		config = function()
			local cmp = require('cmp')
			local luasnip = require('luasnip')
			local lspkind = require('lspkind')

			require('luasnip.loaders.from_vscode').lazy_load()

			cmp.setup({
				completion = {
					completeopt = 'menu,menuone,preview,noselect',
				},
				snippet = {
					expand = function(args)
						luasnip.lsp_expand(args.body)
					end,
				},
				mapping = {
					['<C-k>'] = cmp.mapping.select_prev_item(),
					['<C-j>'] = cmp.mapping.select_next_item(),
					['<C-b>'] = cmp.mapping.scroll_docs(-4),
					['<C-f>'] = cmp.mapping.scroll_docs(4),
					['<C-Space>'] = cmp.mapping.complete(),
					['<C-e>'] = cmp.mapping.abort(),
					['<CR>'] = cmp.mapping.confirm({ select = false }),
				},
				sources = cmp.config.sources({
					{ name = 'nvim_lsp' },
					{ name = 'luasnip' },
					{ name = 'buffer' },
					{ name = 'path' },
				}),
				formatting = {
					format = lspkind.cmp_format({ maxwidth = 50, ellipsis_char = '...' }),
				},
			})
		end,
	},
	{ -- mason (gestión automática de dependencias LSP)
		'williamboman/mason.nvim',
		dependencies = {
			'williamboman/mason-lspconfig.nvim',
			'neovim/nvim-lspconfig',
			'hrsh7th/nvim-cmp',               -- Autocompletado
			'hrsh7th/cmp-buffer',             -- Fuente para texto en el buffer
			'hrsh7th/cmp-path',               -- Fuente para rutas del sistema de archivos
			'hrsh7th/cmp-nvim-lsp',           -- Fuente para LSP
			'saadparwaiz1/cmp_luasnip',       -- Integración con luasnip
			'L3MON4D3/LuaSnip',               -- Motor de snippets
			'rafamadriz/friendly-snippets',   -- Colección de snippets
			'onsails/lspkind.nvim',           -- Iconos en el menú de autocompletado
			'jose-elias-alvarez/null-ls.nvim',-- Integración con linters y formatters
			'jay-babu/mason-null-ls.nvim',    -- Mason integración con null-ls
			'mfussenegger/nvim-dap',          -- Depuración
			'jay-babu/mason-nvim-dap.nvim'    -- Mason integración con nvim-dap
		},
		config = function()
			-- Importar los plugins
			local mason = require("mason")
			local mason_lspconfig = require("mason-lspconfig")
			local lspconfig = require("lspconfig")
			local cmp = require('cmp')
			local luasnip = require('luasnip')
			local lspkind = require('lspkind')
			local cmp_nvim_lsp = require('cmp_nvim_lsp')
			local null_ls = require("null-ls")
			local dap = require('dap')

			-- Configurar mason con iconos personalizados
			mason.setup({
				ui = {
					icons = {
						package_installed = "✓",
						package_pending = "➜",
						package_uninstalled = "✗",
					},
				},
			})

			-- Configurar mason-lspconfig con servidores LSP para instalar
			mason_lspconfig.setup({
				ensure_installed = {
					'clangd',        -- C/C++
					'pyright',       -- Python
					'jdtls',         -- Java
					'kotlin_language_server',  -- Kotlin
					'bashls',        -- Bash
					'solargraph',    -- Ruby
					'jsonls',        -- JSON
					'lemminx',       -- XML
					'html',          -- HTML
					'cssls',         -- CSS
					'sqlls',         -- SQL
					'sumneko_lua',   -- Lua
					'gopls',         -- Go
				},
				automatic_installation = true,
			})

			-- DAP setup
			require('mason-nvim-dap').setup {
				ensure_installed = {
					'codelldb',      -- C/C++
					'debugpy',       -- Python
					'java-debug-adapter', -- Java
					'java-test',     -- Java testing
					'bash-debug-adapter', -- Bash
					'ruby-debug-ide', -- Ruby
					'delve',         -- Go
				},
				automatic_installation = true,
			}

			-- Linters and formatters setup
			require('mason-null-ls').setup {
				ensure_installed = {
					'clang-format',  -- C/C++
					'black',         -- Python
					'prettier',      -- HTML, CSS, JSON
					'eslint',        -- JavaScript
					'stylua',        -- Lua
					'gofmt',         -- Go
					'rubocop',       -- Ruby
					'shellcheck',    -- Bash
					'sqlfluff',      -- SQL
				},
				automatic_installation = true,
			}

			-- Configuración de null-ls
			null_ls.setup({
				sources = {
					null_ls.builtins.formatting.clang_format,
					null_ls.builtins.formatting.black,
					null_ls.builtins.formatting.prettier,
					null_ls.builtins.diagnostics.eslint,
					null_ls.builtins.formatting.stylua,
					null_ls.builtins.formatting.gofmt,
					null_ls.builtins.diagnostics.rubocop,
					null_ls.builtins.diagnostics.shellcheck,
					null_ls.builtins.formatting.sqlfluff,
				},
			})

			-- Configurar manejadores para servidores LSP
			local capabilities = cmp_nvim_lsp.default_capabilities()
			mason_lspconfig.setup_handlers({
				function(server_name)
					lspconfig[server_name].setup({
						capabilities = capabilities,
					})
				end,
			})

			-- Configurar nvim-cmp
			require('luasnip.loaders.from_vscode').lazy_load()
			cmp.setup({
				completion = {
					completeopt = 'menu,menuone,preview,noselect',
				},
				snippet = {
					expand = function(args)
						luasnip.lsp_expand(args.body)
					end,
				},
				mapping = {
					['<C-k>'] = cmp.mapping.select_prev_item(),
					['<C-j>'] = cmp.mapping.select_next_item(),
					['<C-b>'] = cmp.mapping.scroll_docs(-4),
					['<C-f>'] = cmp.mapping.scroll_docs(4),
					['<C-Space>'] = cmp.mapping.complete(),
					['<C-e>'] = cmp.mapping.abort(),
					['<CR>'] = cmp.mapping.confirm({ select = false }),
				},
				sources = cmp.config.sources({
					{ name = 'nvim_lsp' },
					{ name = 'luasnip' },
					{ name = 'buffer' },
					{ name = 'path' },
				}),
				formatting = {
					format = lspkind.cmp_format({ maxwidth = 50, ellipsis_char = '...' }),
				},
			})

			-- Configurar keymaps y autocmd para LSP
			local keymap = vim.keymap
			vim.api.nvim_create_autocmd('LspAttach', {
				group = vim.api.nvim_create_augroup('UserLspConfig', {}),
				callback = function(ev)
					local opts = { buffer = ev.buf, silent = true }
					opts.desc = 'Show LSP references'
					keymap.set('n', 'gR', '<cmd>Telescope lsp_references<CR>', opts)
					opts.desc = 'Go to declaration'
					keymap.set('n', 'gD', vim.lsp.buf.declaration, opts)
					opts.desc = 'Show LSP definitions'
					keymap.set('n', 'gd', '<cmd>Telescope lsp_definitions<CR>', opts)
					opts.desc = 'Show LSP implementations'
					keymap.set('n', 'gi', '<cmd>Telescope lsp_implementations<CR>', opts)
					opts.desc = 'Show LSP type definitions'
					keymap.set('n', 'gt', '<cmd>Telescope lsp_type_definitions<CR>', opts)
					opts.desc = 'See available code actions'
					keymap.set({ 'n', 'v' }, '<leader>ca', vim.lsp.buf.code_action, opts)
					opts.desc = 'Smart rename'
					keymap.set('n', '<leader>rn', vim.lsp.buf.rename, opts)
					opts.desc = 'Show buffer diagnostics'
					keymap.set('n', '<leader>D', '<cmd>Telescope diagnostics bufnr=0<CR>', opts)
					opts.desc = 'Show line diagnostics'
					keymap.set('n', '<leader>d', vim.diagnostic.open_float, opts)
					opts.desc = 'Go to previous diagnostic'
					keymap.set('n', '[d', vim.diagnostic.goto_prev, opts)
					opts.desc = 'Go to next diagnostic'
					keymap.set('n', ']d', vim.diagnostic.goto_next, opts)
					opts.desc = 'Show documentation for what is under cursor'
					keymap.set('n', 'K', vim.lsp.buf.hover, opts)
				end,
			})

			-- Cambiar los símbolos de Diagnóstico en la columna de signos (gutter)
			local signs = { Error = ' ', Warn = ' ', Hint = '󰠠 ', Info = ' ' }
			for type, icon in pairs(signs) do
				local hl = 'DiagnosticSign' .. type
				vim.fn.sign_define(hl, { text = icon, texthl = hl, numhl = '' })
			end
		end,
	},
})
