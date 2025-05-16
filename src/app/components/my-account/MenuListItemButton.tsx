import { ListItemButton, ListItemText } from "@mui/material";

interface MenuListItemButtonProps {
  text: string;
  selected: boolean;
  onClick: () => void;
}

const MenuListItemButton: React.FC<MenuListItemButtonProps> = ({
  text,
  selected,
  onClick,
}) => {
  return (
    <ListItemButton
      onClick={onClick}
      sx={{
        backgroundColor: selected ? "rgba(255, 255, 255, 0.1)" : "transparent",
        color: "white",
      }}
    >
      <ListItemText primary={text} />
    </ListItemButton>
  );
};

export default MenuListItemButton;
