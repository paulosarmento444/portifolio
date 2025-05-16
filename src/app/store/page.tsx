"use client";

import { useState, useEffect, useRef } from "react";
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  IconButton,
  CircularProgress,
  Typography,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import Header from "../components/Header";
import {
  getCategories,
  getProducts,
  getProductsCategory,
} from "../service/ProductService";
import { Product } from "../types/product";
import { Categories } from "../types/category";
import { ProductCard } from "./[id]/ProductCard";

export default function StorePage() {
  const [state, setState] = useState({
    categories: [] as Categories,
    selectedCategory: null as number | null,
    products: [] as Product[],
    showCategories: false,
    currentPage: 1,
    isLoading: true,
    noProductsMessage: null as string | null,
  });

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categories = await getCategories();
        setState((prevState) => ({ ...prevState, categories }));
      } catch (error) {
        console.error("Failed to fetch categories", error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setState((prevState) => ({ ...prevState, isLoading: true }));
      try {
        const products =
          state.selectedCategory !== null
            ? await getProductsCategory(state.selectedCategory)
            : await getProducts();

        setState((prevState) => ({
          ...prevState,
          products,
          noProductsMessage: products.length
            ? null
            : "No products found in this category.",
          isLoading: false,
        }));
      } catch (error) {
        console.error("Failed to fetch products", error);
        setState((prevState) => ({
          ...prevState,
          noProductsMessage: "Failed to load products.",
          isLoading: false,
        }));
      }
    };
    fetchProducts();
  }, [state.selectedCategory]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setState((prevState) => ({ ...prevState, showCategories: false }));
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCategoryChange = (categoryId: number) => {
    setState((prevState) => ({
      ...prevState,
      selectedCategory:
        prevState.selectedCategory === categoryId ? null : categoryId,
      currentPage: 1,
      showCategories: false,
    }));
  };

  const toggleCategories = () =>
    setState((prevState) => ({
      ...prevState,
      showCategories: !prevState.showCategories,
    }));

  const handlePaginationChange = (pageNumber: number) => {
    setState((prevState) => ({ ...prevState, currentPage: pageNumber }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const indexOfLastProduct = state.currentPage * 12;
  const currentProducts = state.products.slice(
    indexOfLastProduct - 12,
    indexOfLastProduct
  );
  const totalPages = Math.ceil(state.products.length / 12);

  return (
    <>
      <Header />
      <Box sx={{ display: "flex", mt: "120px" }}>
        <IconButton
          sx={{
            display: { sm: "none" },
            position: "fixed",
            top: 100,
            right: 16,
            zIndex: 1300,
            color: "white",
          }}
          onClick={toggleCategories}
        >
          <MenuIcon />
        </IconButton>
        <Drawer
          anchor="left"
          open={state.showCategories}
          onClose={toggleCategories}
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
            <IconButton onClick={toggleCategories} color="inherit">
              <CloseIcon />
            </IconButton>
          </Box>
          <List>
            {state.categories.map((category) => (
              <ListItemButton
                key={category.id}
                selected={state.selectedCategory === category.id}
                sx={{
                  backgroundColor:
                    state.selectedCategory === category.id
                      ? "rgba(255, 255, 255, 0.1)"
                      : "transparent",
                  "&.Mui-selected": {
                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                  },
                  color: "white",
                }}
                onClick={() => handleCategoryChange(category.id)}
              >
                <ListItemText primary={category.name} />
              </ListItemButton>
            ))}
          </List>
        </Drawer>
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
              },
            }}
            open
          >
            <List>
              {state.categories.map((category) => (
                <ListItemButton
                  key={category.id}
                  selected={state.selectedCategory === category.id}
                  sx={{
                    backgroundColor:
                      state.selectedCategory === category.id
                        ? "rgba(255, 255, 255, 0.1)"
                        : "transparent",
                    "&.Mui-selected": {
                      backgroundColor: "rgba(255, 255, 255, 0.2)",
                    },
                    color: "white",
                  }}
                  onClick={() => handleCategoryChange(category.id)}
                >
                  <ListItemText primary={category.name} />
                </ListItemButton>
              ))}
            </List>
          </Drawer>
        </Box>
        <Box
          component="main"
          sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - 240px)` } }}
        >
          {state.isLoading ? (
            <Box
              display="flex"
              flexDirection="column"
              justifyContent="center"
              alignItems="center"
              height="calc(100vh - 150px)"
            >
              <CircularProgress />
            </Box>
          ) : state.noProductsMessage ? (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              height="calc(100vh - 150px)"
            >
              <Typography variant="h6">{state.noProductsMessage}</Typography>
            </Box>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 lg:gap-8">
                {currentProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              <Box display="flex" justifyContent="center" mt={8}>
                <div className="flex items-center space-x-4">
                  {Array.from({ length: totalPages }, (_, index) => (
                    <button
                      key={index}
                      className={`px-4 py-2 rounded-lg ${
                        state.currentPage === index + 1
                          ? "bg-lime-300 text-black"
                          : "bg-white text-black"
                      } hover:bg-lime-300 hover:text-black`}
                      onClick={() => handlePaginationChange(index + 1)}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
              </Box>
            </>
          )}
        </Box>
      </Box>
    </>
  );
}
