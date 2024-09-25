"use server";

import { revalidatePath } from "next/cache";

interface WishlistRequest {
  accountId: number;
  amount: number;
  title: string;
  description: string;
  taxId: number | null;
  priority: number;
  urlLink: string;
}

export async function addWishlist(wishlist: WishlistRequest) {
  const response = await fetch("http://server:5001/api/wishlists", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(wishlist),
  });
  const result = await response.json();

  revalidatePath("/[accountId]", "page");
  return result;
}

export async function editWishlist(wishlist: WishlistRequest, id: number) {
  const response = await fetch(`http://server:5001/api/wishlists/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(wishlist),
  });
  const result = await response.json();

  revalidatePath("/[accountId]", "page");
  return result;
}

export async function deleteWishlist(id: number) {
  await fetch(`http://server:5001/api/wishlists/${id}`, {
    method: "DELETE",
  });

  revalidatePath("/[accountId]", "page");
}
