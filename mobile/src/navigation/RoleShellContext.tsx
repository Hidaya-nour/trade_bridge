import { createContext, useContext } from "react";

interface RoleShellContextValue {
  openDrawer: () => void;
  closeDrawer: () => void;
  setTabBarVisible: (visible: boolean) => void;
  tabBarInset: number;
  hasRoleShell: boolean;
}

const noop = () => {};

const RoleShellContext = createContext<RoleShellContextValue>({
  openDrawer: noop,
  closeDrawer: noop,
  setTabBarVisible: noop,
  tabBarInset: 0,
  hasRoleShell: false,
});

export const RoleShellProvider = RoleShellContext.Provider;

export const useRoleShell = () => useContext(RoleShellContext);
