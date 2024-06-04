-- Opciones nativas del editor vim --
-- ------------------------------- --
vim.opt.number = true
vim.opt.relativenumber = true
vim.opt.splitbelow = true 
vim.opt.splitright = true
vim.opt.wrap = false -- para que el cursor vaya fluido en archivos con lines largas
vim.opt.tabstop = 4 -- como se convierten los tabs al guardar el archivo
vim.opt.shiftwidth = 4 -- indentacion de tab (con > y <)
vim.opt.clipboard = "unnamedplus" --sincronizar clipboard con el del sistema
vim.opt.scrolloff = 999 -- centrar mouse cuando haces scroll
vim.opt.virtualedit = "block" -- permitir que el bloque visual vaya más allá del EOL
vim.opt.inccommand = "split" -- muestra todas las lineas a cambiar juntas en un split
vim.opt.ignorecase = true -- para que muestre autocompletado de comandos siempre
vim.opt.termguicolors = true -- para que se muestren más colores n terminales modernas

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
	"rebelot/kanagawa.nvim"
})

-- Colorscheme --
-- ----------- --
vim.cmd.colorscheme("kanagawa-dragon")
