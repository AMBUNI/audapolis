import { BrowserWindow, Menu, MenuItemConstructorOptions, shell } from 'electron';
import { createWindow } from './index';
import { MenuItemConstructorOptionsIpc } from './types';
import { exportDebugLog, contextMenuClick, menuBarClick, openAbout } from '../ipc/ipc_main';

export const menuMap: Record<number, Menu> = {};

function onMac(
  mac: MenuItemConstructorOptions[],
  otherPlatforms: MenuItemConstructorOptions[] = []
): MenuItemConstructorOptions[] {
  return process.platform === 'darwin' ? mac : otherPlatforms;
}

export function transformMenuTemplate(
  x: MenuItemConstructorOptionsIpc[],
  callback: (click: string) => void
): MenuItemConstructorOptions[] {
  const transformMenuTemplateInner = (
    x: MenuItemConstructorOptionsIpc[]
  ): MenuItemConstructorOptions[] => {
    return x.map((x) => {
      return {
        ...x,
        click: () => {
          x.click && callback(x.click);
        },
        submenu: x.submenu && transformMenuTemplateInner(x.submenu),
      };
    });
  };
  const template = transformMenuTemplateInner(x);
  return template;
}

export function setMenuBar(window: BrowserWindow, args: MenuItemConstructorOptionsIpc[]): void {
  const templateInner = transformMenuTemplate(args, (uuid) => menuBarClick(window, uuid));
  const template = [
    ...onMac([
      {
        role: 'appMenu',
      },
    ]),
    ...templateInner,
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        {
          label: window.isMaximized() ? 'Un-Maximize' : 'Maximize',
          click: async function () {
            if (window.isMaximized()) {
              window.unmaximize();
            } else {
              window.maximize();
            }
          },
        },
        { role: 'togglefullscreen' },
        ...onMac(
          [{ type: 'separator' }, { role: 'front' }, { role: 'close' }],
          [{ role: 'close' }]
        ),
        { type: 'separator' },
        { role: 'toggleDevTools', accelerator: 'CommandOrControl+Alt+I' },
        {
          label: 'New Window',
          click: function () {
            createWindow();
          },
          accelerator: 'CommandOrControl+N',
        },
        { type: 'separator' },
        {
          role: 'ZoomIn',
          accelerator: 'CommandOrControl+plus',
        },
        {
          role: 'ZoomOut',
          accelerator: 'CommandOrControl+-',
        },
        {
          role: 'ResetZoom',
          accelerator: 'CommandOrControl+0',
        },
      ],
    },
    {
      role: 'help',
      submenu: [
        {
          label: 'About',
          click: () => openAbout(window),
        },
        {
          label: 'Export debug log',
          click: async () => await exportDebugLog(window),
        },
        {
          label: 'Learn More',
          click: async () => {
            await shell.openExternal('https://github.com/audapolis/audapolis');
          },
        },
      ],
    },
  ] as MenuItemConstructorOptions[];

  menuMap[window.id] = Menu.buildFromTemplate(template);
  applyMenuBar(window);
}

export function applyMenuBar(window: BrowserWindow): void {
  const focusedWindow = BrowserWindow.getFocusedWindow();
  if (focusedWindow?.id == window.id) {
    const menu = menuMap[focusedWindow.id];
    Menu.setApplicationMenu(menu);
  }
}

export function showMenuBar(window: BrowserWindow): void {
  menuMap[window.id].popup({
    x: 0,
    y: 55,
  });
}

export function showContextMenu(
  window: BrowserWindow,
  menu: MenuItemConstructorOptionsIpc[]
): void {
  const menuTemplate = transformMenuTemplate(menu, (uuid) => contextMenuClick(window, uuid));
  Menu.buildFromTemplate(menuTemplate).popup({ window });
}
