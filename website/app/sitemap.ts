import { MetadataRoute } from "next";

import { endpoints } from "./_constants/endpoints/endpoints";
import api from "@/config/api.interceptor";
const baseURL = process.env.NEXT_PUBLIC_BASE_URL;

async function getProductsSitemap(): Promise<MetadataRoute.Sitemap> {
  let allProducts: any[] = [];
  let currentPage = 1;
  let hasMorePages = true;

  // Fetch all pages
  while (hasMorePages) {
    const body = {
      page: currentPage,
      limit: 100, // Increase limit for fewer API calls
      sort: "2",
    };

    try {
      const data = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}${endpoints.productsByCategory}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );

      const res = await data.json();
      const products = res?.result?.products?.product_items || [];

      console.log(`Page ${currentPage}: ${products.length} products`);

      // Add products to our collection
      allProducts.push(...products);

      // Check if we have more pages
      // Adjust this condition based on your API response structure
      hasMorePages = products.length === body.limit; // If we got full page, there might be more

      // Alternative: if your API returns total count or hasNextPage
      // hasMorePages = res?.result?.hasNextPage;
      // hasMorePages = allProducts.length < res?.result?.totalCount;

      currentPage++;
    } catch (error) {
      console.error(`Error fetching page ${currentPage}:`, error);
      hasMorePages = false; // Stop on error
    }
  }

  console.log(`Total products fetched: ${allProducts.length}`);

  return allProducts.map((item: any) => ({
    url: `${baseURL}products/${item?.params?.slug}`,
    lastModified: new Date(),
    priority: 0.8, // Optional: add priority for product pages
  }));
}

async function getBlogsSitemap(): Promise<MetadataRoute.Sitemap> {
  let allBlogs: any[] = [];
  let currentPage = 1;
  let hasMorePages = true;

  // Fetch all pages
  while (hasMorePages) {
    const body = {
      page: currentPage,
      limit: 50, // Reasonable limit per page
    };

    try {
      const data = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}${endpoints.blogs}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );

      const res = await data.json();
      const blogs = res?.result?.blogs?.data || [];

      console.log(`Page ${currentPage}: ${blogs.length} blogs`);

      // Add blogs to our collection
      allBlogs.push(...blogs);

      // Check if we have more pages
      // Adjust this condition based on your API response structure
      hasMorePages = blogs.length === body.limit; // If we got full page, there might be more

      // Alternative: if your API returns pagination info
      // hasMorePages = res?.result?.blogs?.hasNextPage;
      // hasMorePages = currentPage < res?.result?.blogs?.totalPages;

      currentPage++;
    } catch (error) {
      console.error(`Error fetching blogs page ${currentPage}:`, error);
      hasMorePages = false; // Stop on error
    }
  }

  console.log(`Total blogs fetched: ${allBlogs.length}`);

  return allBlogs.map((item: any) => ({
    url: `${baseURL}blogs/${item?.slug}`,
    lastModified: new Date(),
    priority: 0.7,
  }));
}

async function getCategoriesSitemap(): Promise<MetadataRoute.Sitemap> {
  let allCategories: any[] = [];
  let currentPage = 1;
  let hasMorePages = true;

  // Fetch all pages
  while (hasMorePages) {
    const body = {
      page: currentPage,
      limit: 100, // Keep 100 as it's already a good page size
    };

    try {
      const data = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}${endpoints.categoriesList}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );

      const res = await data.json();
      const categories = res?.result?.categories || [];

      console.log(`Page ${currentPage}: ${categories.length} categories`);

      // Add categories to our collection
      allCategories.push(...categories);

      // Check if we have more pages
      // If we got fewer categories than limit, we've reached the end
      hasMorePages = categories.length === body.limit;

      // Alternative: if your API returns pagination info
      // hasMorePages = res?.result?.hasNextPage;
      // hasMorePages = currentPage < res?.result?.totalPages;

      currentPage++;
    } catch (error) {
      console.error(`Error fetching categories page ${currentPage}:`, error);
      hasMorePages = false; // Stop on error
    }
  }

  console.log(`Total categories fetched: ${allCategories.length}`);

  return (
    allCategories.map((item: any) => ({
      url: `${baseURL}categories/${item?.params?.slug}`,
      lastModified: new Date(item?.updatedAt || item?.createdAt || new Date()),
      priority: 0.7,
    })) || []
  );
}

async function getCollectionsSitemap(): Promise<MetadataRoute.Sitemap> {
  let allCollections: any[] = [];
  let currentPage = 1;
  let hasMorePages = true;

  // Fetch all pages
  while (hasMorePages) {
    const body = {
      page: currentPage,
      limit: 100, // Keep 100 as it's already a good page size
    };

    try {
      const data = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}${endpoints.collections}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );

      const res = await data.json();
      const collections = res?.result?.data || [];

      console.log(`Page ${currentPage}: ${collections.length} collections`);

      // Add collections to our collection
      allCollections.push(...collections);

      // Check if we have more pages
      // If we got fewer collections than limit, we've reached the end
      hasMorePages = collections.length === body.limit;

      // Alternative: if your API returns pagination info
      // hasMorePages = res?.result?.hasNextPage;
      // hasMorePages = currentPage < res?.result?.totalPages;

      currentPage++;
    } catch (error) {
      console.error(`Error fetching collections page ${currentPage}:`, error);
      hasMorePages = false; // Stop on error
    }
  }

  console.log(`Total collections fetched: ${allCollections.length}`);

  return (
    allCollections.map((item: any) => ({
      url: `${baseURL}collections/${item?.slug}`,
      lastModified: new Date(item?.updatedAt || item?.createdAt || new Date()),
      priority: 0.7,
    })) || []
  );
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseSitemap = [
    {
      url: `${baseURL}`,
      lastModified: new Date(),
      priority: 1,
    },
    {
      url: `${baseURL}products`,
      lastModified: new Date(),
      priority: 1,
    },
    {
      url: `${baseURL}categories`,
      lastModified: new Date(),
      priority: 1,
    },
    {
      url: `${baseURL}blogs`,
      lastModified: new Date(),
      priority: 1,
    },
    {
      url: `${baseURL}about`,
      lastModified: new Date(),
      priority: 0.8,
    },
    {
      url: `${baseURL}careers`,
      lastModified: new Date(),
      priority: 0.8,
    },
    {
      url: `${baseURL}contact-us`,
      lastModified: new Date(),
      priority: 0.8,
    },
    {
      url: `${baseURL}faqs`,
      lastModified: new Date(),
      priority: 0.8,
    },
    {
      url: `${baseURL}shipping-policy`,
      lastModified: new Date(),
      priority: 0.8,
    },
    {
      url: `${baseURL}refund-policy`,
      lastModified: new Date(),
      priority: 0.8,
    },
    {
      url: `${baseURL}privacy-policy`,
      lastModified: new Date(),
      priority: 0.8,
    },
    {
      url: `${baseURL}terms-and-conditions`,
      lastModified: new Date(),
      priority: 0.8,
    },
  ];

  const [blogsSitemap, productsSitemap, categoriesSitemap, collectionsSitemap] =
    await Promise.all([
      getBlogsSitemap(),
      getProductsSitemap(),
      getCategoriesSitemap(),
      getCollectionsSitemap(),
    ]);

  return [
    ...baseSitemap,
    ...blogsSitemap,
    ...productsSitemap,
    ...categoriesSitemap,
    ...collectionsSitemap,
  ];
}
