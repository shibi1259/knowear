// "use client";
// import React, { useContext, useEffect } from "react";
// import Link from "next/link";
// import Image from "next/image";
// import WishlistButton from "../buttons/wishlist/WishlistButton";
// import { ProductCardProps } from "@/types/productCard.types";
// import { StateContext } from "@/providers/state/StateContext";
// import { Button } from "@/components/ui/button";
// import { Trash2 } from "lucide-react";
// import api from "@/config/api.interceptor";
// import { endpoints } from "@/app/_constants/endpoints/endpoints";
// import { toast } from "@/hooks/use-toast";
// import { useRouter } from "next/navigation";

// const ProductCard = (props: {
//   productDetails: ProductCardProps;
//   wishlist?: boolean;
// }) => {
//   const router = useRouter();
//   const { wishlistDetails, getWishlistDetails, getCartDetails } =
//     useContext(StateContext);
//   const [isWishlisted, setIsWishlisted] = React.useState(false);

//   useEffect(() => {
//     const wishlistIds =
//       wishlistDetails &&
//       wishlistDetails?.map((wishlistItem: any) => {
//         return wishlistItem.params.slug;
//       });
//     const isWishlisted =
//       wishlistIds?.includes(props.productDetails.params.slug) || false;
//     setIsWishlisted(isWishlisted);
//   }, [wishlistDetails]);

//   const handleWishlist = () => {
//     api
//       .post(endpoints.manageWishList, {
//         slug: props.productDetails?.params?.slug,
//       })
//       .then((res) => {
//         if (res?.data?.errorCode == 0) {
//           getWishlistDetails();
//         } else {
//         }
//       })
//       .catch((error: any) => { });
//   };

//   const addToCart = () => {
//     if (props.productDetails?.isCart) {
//       router.push("/cart");
//       return;
//     }
//     api
//       .post(endpoints.addToCart, {
//         product: props.productDetails.params.slug,
//         quantity: 1,
//       })
//       .then((response: any) => {
//         if (response.data.errorCode == 0) {
//           getCartDetails();
//           getWishlistDetails();
//           toast({ description: response.data.message, variant: "success" });
//         } else {
//           toast({ description: response.data.message, variant: "destructive" });
//           getCartDetails();
//         }
//       })
//       .catch((error: any) => { });
//   };

//   return (
//     <>
//       {props.productDetails && (
//         <div
//           className={`group border border-[#DEDEDE] ${props?.wishlist ? "bg-[#FAFAFA]" : ""
//             }`}
//         >
//           {/* IMAGE SECTION */}
//           <div className="relative bg-white overflow-hidden">
//             <Link href={`/p/${props.productDetails?.params?.slug}`}>
//               <Image
//                 width={858}
//                 height={1317}
//                 src={props.productDetails.thumbnail.thumbnail}
//                 alt={props.productDetails.name.text}
//                 className="w-full object-cover transition-all duration-300"
//                 sizes="(max-width: 640px) 100vw, (max-width:768px) 50vw, 33vw"
//                 loading="lazy"
//                 quality={75}
//               />
//             </Link>

//             {/* Hover image (non-click blocking) */}
//             <div className="hidden xl:block pointer-events-none">
//               <Image
//                 width={858}
//                 height={1317}
//                 src={props.productDetails.hoverMedias.thumbnail}
//                 alt={props.productDetails.name.text}
//                 className="w-full object-cover absolute top-0 left-0 h-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
//                 sizes="(max-width: 1280px) 0vw, 33vw"
//                 loading="lazy"
//               />
//             </div>

//             {/* Badges */}
//             <div className="pointer-events-none absolute top-[9px] left-[11px] bg-white text-[10px] lg:text-xs text-[#757575] px-2 h-6 flex items-center">
//               {props.productDetails.donationPercentage.text}
//             </div>

//             <div className="pointer-events-none absolute bottom-0 left-0 bg-[#364A46] text-xs text-white px-2 h-[18px] md:h-6 flex items-center">
//               New
//             </div>

//             {/* Wishlist button (clickable) */}
//             <div className="absolute top-4 right-3 z-20">
//               <WishlistButton
//                 productSlug={props.productDetails.params.slug}
//                 isWishlisted={isWishlisted}
//               />
//             </div>
//           </div>

//           {/* CONTENT SECTION (clickable) */}
//           <Link
//             href={`/p/${props.productDetails?.params?.slug}`}
//             className={`block px-2 lg:px-4 pt-3 pb-4 border-t border-gray-200 ${!props?.wishlist ? "bg-white" : ""
//               }`}
//           >
//             <h6 className="text-black text-sm md:text-base font-medium line-clamp-1">
//               {props.productDetails.name.text}
//             </h6>

//             <p className="hidden lg:block text-sm text-gray-500 line-clamp-1">
//               {props.productDetails.overview.text}
//             </p>

//             <ul className="flex items-center space-x-2 mt-3 whitespace-nowrap">
//               <li className="text-black text-sm lg:text-base font-medium">
//                 {props.productDetails.price.text}
//               </li>

//               {props.productDetails?.actualPrice.text && (
//                 <li className="text-gray-400 text-xs line-through">
//                   {props.productDetails.actualPrice.text}
//                 </li>
//               )}

//               {props.productDetails?.percentageOff.text && (
//                 <li className="text-xs bg-gray-300 px-1 h-4 flex items-center">
//                   {props.productDetails.percentageOff.text}
//                 </li>
//               )}
//             </ul>
//           </Link>
//         </div>
//       )}
//     </>
//   );
// };

// export default ProductCard;
"use client";
import React, { useContext, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import WishlistButton from "../buttons/wishlist/WishlistButton";
import { ProductCardProps } from "@/types/productCard.types";
import { StateContext } from "@/providers/state/StateContext";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import api from "@/config/api.interceptor";
import { endpoints } from "@/app/_constants/endpoints/endpoints";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

const ProductCard = ({
  productDetails,
  wishlist = false,
}: {
  productDetails: ProductCardProps;
  wishlist?: boolean;
}) => {
  const router = useRouter();
  const { wishlistDetails, getWishlistDetails, getCartDetails } =
    useContext(StateContext);

  // ✅ Optimized wishlist check (no useEffect)
  const isWishlisted = useMemo(() => {
    if (!wishlistDetails) return false;
    return wishlistDetails.some(
      (item: any) => item.params.slug === productDetails.params.slug
    );
  }, [wishlistDetails, productDetails.params.slug]);

  // ✅ Handle remove/add wishlist
  const handleWishlist = async () => {
    if (!productDetails?.params?.slug) return;

    try {
      const res = await api.post(endpoints.manageWishList, {
        slug: productDetails.params.slug,
      });

      if (res?.data?.errorCode === 0) {
        getWishlistDetails();
        toast({
          description: isWishlisted
            ? "Removed from wishlist"
            : "Added to wishlist",
          variant: "success",
        });
      }
    } catch (err) {
      toast({
        description: "Something went wrong",
        variant: "destructive",
      });
    }
  };

  // ✅ Add to cart
  const addToCart = async () => {
    if (productDetails?.isCart) {
      router.push("/cart");
      return;
    }

    try {
      const response = await api.post(endpoints.addToCart, {
        product: productDetails.params.slug,
        quantity: 1,
      });

      if (response.data.errorCode === 0) {
        getCartDetails();
        getWishlistDetails();
        toast({
          description: response.data.message,
          variant: "success",
        });
      } else {
        toast({
          description: response.data.message,
          variant: "destructive",
        });
        getCartDetails();
      }
    } catch (err) {
      toast({
        description: "Failed to add to cart",
        variant: "destructive",
      });
    }
  };

  if (!productDetails) return null;

  return (
    <div
      className={`group border border-[#DEDEDE] ${
        wishlist ? "bg-[#FAFAFA]" : ""
      }`}
    >
      {/* IMAGE SECTION */}
      <div className="relative bg-white overflow-hidden">
        <Link href={`/p/${productDetails.params.slug}`}>
          <Image
            width={858}
            height={1317}
            src={productDetails.thumbnail.thumbnail}
            alt={productDetails.name.text}
            className="w-full object-cover transition-all duration-300"
            sizes="(max-width: 640px) 100vw, (max-width:768px) 50vw, 33vw"
            loading="lazy"
            quality={75}
          />
        </Link>

        {/* Hover image */}
        <div className="hidden xl:block pointer-events-none">
          <Image
            width={858}
            height={1317}
            src={productDetails.hoverMedias.thumbnail}
            alt={productDetails.name.text}
            className="w-full object-cover absolute top-0 left-0 h-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            sizes="(max-width: 1280px) 0vw, 33vw"
            loading="lazy"
          />
        </div>

        {/* Badges */}
        <div className="pointer-events-none absolute top-[9px] left-[11px] bg-white text-[10px] lg:text-xs text-[#757575] px-2 h-6 flex items-center">
          {productDetails.donationPercentage.text}
        </div>

        <div className="pointer-events-none absolute bottom-0 left-0 bg-[#364A46] text-xs text-white px-2 h-[18px] md:h-6 flex items-center">
          New
        </div>

        {/* Wishlist toggle */}
        <div className="absolute top-4 right-3 z-20">
          <WishlistButton
            productSlug={productDetails.params.slug}
            isWishlisted={isWishlisted}
          />
        </div>
      </div>

      {/* CONTENT */}
      <Link
        href={`/p/${productDetails.params.slug}`}
        className={`block px-2 lg:px-4 pt-3 pb-4 border-t border-gray-200 ${
          !wishlist ? "bg-white" : ""
        }`}
      >
        <h6 className="text-black text-sm md:text-base font-medium line-clamp-1">
          {productDetails.name.text}
        </h6>

        <p className="hidden lg:block text-sm text-gray-500 line-clamp-1">
          {productDetails.overview.text}
        </p>

        <ul className="flex items-center space-x-2 mt-3 whitespace-nowrap">
          <li className="text-black text-sm lg:text-base font-medium">
            {productDetails.price.text}
          </li>

          {productDetails?.actualPrice.text && (
            <li className="text-gray-400 text-xs line-through">
              {productDetails.actualPrice.text}
            </li>
          )}

          {productDetails?.percentageOff.text && (
            <li className="text-xs bg-gray-300 px-1 h-4 flex items-center">
              {productDetails.percentageOff.text}
            </li>
          )}
        </ul>
      </Link>

      {/* ✅ Wishlist Mode Actions */}
      {wishlist && (
        <div className="flex gap-2.5 h-[40px] mx-3 mb-3">
          <Button
            onClick={addToCart}
            className="flex items-center justify-center grow bg-black text-white rounded-none"
          >
            {productDetails?.isCart ? "Go to Cart" : "Move to Cart"}
          </Button>

          <button
            onClick={handleWishlist}
            className="w-[40px] border border-[#DEDEDE] flex items-center justify-center"
          >
            <Trash2 className="text-[#FF9C9C] size-[18px]" />
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductCard;