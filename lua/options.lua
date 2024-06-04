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

