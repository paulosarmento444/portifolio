import { useRef, useEffect } from "react";
import { Box, Drawer, List, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import MenuIcon from "@mui/icons-material/Menu";
import MenuListItemButton from "./MenuListItemButton";

interface MenuDrawerProps {
  selectedMenu: string;
  openDrawer: boolean;
  onMenuClick: (menu: string) => void;
  onToggleDrawer: () => void;
}

const MenuDrawer: React.FC<MenuDrawerProps> = ({
  selectedMenu,
  openDrawer,
  onMenuClick,
  onToggleDrawer,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onToggleDrawer();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef, onToggleDrawer]);

  return (
    <>
      {/* Mobile Drawer */}
      <IconButton
        sx={{
          display: { sm: "none" },
          position: "fixed",
          top: 100,
          right: 16,
          zIndex: 1300,
          color: "white",
        }}
        onClick={onToggleDrawer}
      >
        <MenuIcon />
      </IconButton>

      <Drawer
        anchor="left"
        open={openDrawer}
        onClose={() => onToggleDrawer()}
        sx={{
          display: { sm: "none" },
          "& .MuiDrawer-paper": {
            width: 250,
            backgroundColor: "#333",
            color: "white",
          },
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "flex-end", p: 1 }}>
          <IconButton onClick={() => onToggleDrawer()} color="inherit">
            <CloseIcon />
          </IconButton>
        </Box>
        <List>
          <MenuListItemButton
            text="WELCOME"
            selected={selectedMenu === "welcome"}
            onClick={() => onMenuClick("welcome")}
          />
          <MenuListItemButton
            text="MY ORDERS"
            selected={selectedMenu === "orders"}
            onClick={() => onMenuClick("orders")}
          />
          <MenuListItemButton
            text="MY POSTS"
            selected={selectedMenu === "posts"}
            onClick={() => onMenuClick("posts")}
          />
          <MenuListItemButton
            text="ADDRESSES"
            selected={selectedMenu === "addresses"}
            onClick={() => onMenuClick("addresses")}
          />
          <MenuListItemButton
            text="MY ACCOUNT"
            selected={selectedMenu === "account"}
            onClick={() => onMenuClick("account")}
          />
          <MenuListItemButton
            text="MY EVENTS"
            selected={selectedMenu === "events"}
            onClick={() => onMenuClick("events")}
          />

          <MenuListItemButton
            text="LOGOUT"
            selected={selectedMenu === "logout"}
            onClick={() => onMenuClick("logout")}
          />
        </List>
      </Drawer>

      {/* Drawer for large screens */}
      <Box
        component="nav"
        sx={{
          width: { sm: 240 },
          flexShrink: { sm: 0 },
          display: { xs: "none", sm: "block" },
        }}
      >
        <Drawer
          variant="permanent"
          sx={{
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              top: 120,
              width: 240,
              backgroundColor: "transparent",
              color: "white",
              borderTopLeftRadius: 16,
              borderBottomLeftRadius: 16,
            },
          }}
          open
        >
          <List>
            <MenuListItemButton
              text="WELCOME"
              selected={selectedMenu === "welcome"}
              onClick={() => onMenuClick("welcome")}
            />
            <MenuListItemButton
              text="MY ORDERS"
              selected={selectedMenu === "orders"}
              onClick={() => onMenuClick("orders")}
            />
            <MenuListItemButton
              text="MY POSTS"
              selected={selectedMenu === "posts"}
              onClick={() => onMenuClick("posts")}
            />
            <MenuListItemButton
              text="ADDRESSES"
              selected={selectedMenu === "addresses"}
              onClick={() => onMenuClick("addresses")}
            />
            <MenuListItemButton
              text="MY ACCOUNT"
              selected={selectedMenu === "account"}
              onClick={() => onMenuClick("account")}
            />

            <MenuListItemButton
              text="LOGOUT"
              selected={selectedMenu === "logout"}
              onClick={() => onMenuClick("logout")}
            />
          </List>
        </Drawer>
      </Box>
    </>
  );
};

export default MenuDrawer;
