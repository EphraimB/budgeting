"use server";

import { revalidatePath } from "next/cache";

interface WishlistRequest {
  account_id: number;
  amount: number;
  title: string;
  description: string;
  tax_id: number | null;
  priority: number;
  url_link: string;
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

  console.log(result);

  revalidatePath("/[account_id]", "page");
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

  revalidatePath("/[account_id]", "page");
  return result;
}

export async function deleteWishlist(id: number) {
  await fetch(`http://server:5001/api/wishlists/${id}`, {
    method: "DELETE",
  });

  revalidatePath("/[account_id]", "page");
}
