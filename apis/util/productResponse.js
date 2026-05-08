const { console } = require("inspector");

exports.getProductResponse = (productDetails, settings) => {  
   //return  productDetails?.hoverThumbnail;
  // return productDetails?.thumbnail;
    let message = {}
    let offerExists = productDetails?.offerExists || false;
    if (offerExists) {
        if (productDetails?.price?.selling != productDetails?.price?.mrp) {
            const difference = productDetails?.price?.mrp - productDetails?.price?.selling;
            const percentageOff = Math.round((difference / productDetails?.price?.mrp) * 100);
            message = { text: `Save ${percentageOff}%`, };
        }
    }
   
    const medias= productDetails?.files?.length ?  `${process.env.BASE_URL}${productDetails?.files?.[0]}` :`${process.env.BASE_URL}${productDetails?.thumbnail}` ;
    
    // const hoverMedias= productDetails?.files?.length >0 ?  `${process.env.BASE_URL}${productDetails?.files?.[1]}` : productDetails?.files?.length? `${process.env.BASE_URL}${productDetails?.files?.[0]}` :`${process.env.BASE_URL}${productDetails?.thumbnail}` ;
const hoverMedias =productDetails?.hoverThumbnail?`${process.env.BASE_URL}${productDetails?.hoverThumbnail}`:`${process.env.BASE_URL}${productDetails?.thumbnail}`;
const thumbnailMedia =productDetails?.thumbnail?`${process.env.BASE_URL}${productDetails?.thumbnail}`:`${process.env.BASE_URL}${productDetails?.thumbnail}`;
    
    return {
        id: productDetails?._id,
        medias: { type: "image", thumbnail: medias },
        hoverMedias: { type: "image", thumbnail: hoverMedias },
        thumbnail: { type: "image", thumbnail: thumbnailMedia },
        params: { slug: productDetails?.slug },
        attributes: productDetails?.attributes ? productDetails?.attributes : [],
        name: { text: productDetails?.name },
        overview: { text: productDetails?.overview },
        price: { text: `${settings?.currency} ${Number(productDetails?.price?.selling).toFixed(2)}` },
        // actualPrice: { text: `${settings?.currency} ${productDetails?.price?.mrp}` },
        actualPrice: { 
            text: productDetails?.price?.mrp === productDetails?.price?.selling 
                ? null 
                : `${settings?.currency} ${productDetails?.price?.mrp}` 
        },
        donationPercentage: { text: `${productDetails?.donationPercentage}% is Donated to Education` },
        percentageOff: message,
        inStock: productDetails?.stock > 0 ? true : false,
        category: productDetails?.category
    }
}

exports.getHotspotResponse = (productDetails,hotspot, settings) => {  
    //return  productDetails?.hoverThumbnail;
   // return productDetails?.thumbnail;
     let message = {}
     let offerExists = productDetails?.offerExists || false;
     if (offerExists) {
         if (productDetails?.price?.selling != productDetails?.price?.mrp) {
             const difference = productDetails?.price?.mrp - productDetails?.price?.selling;
             const percentageOff = Math.round((difference / productDetails?.price?.mrp) * 100);
             message = { text: `Save ${percentageOff}%`, };
         }
     }
    
     const medias= productDetails?.files?.length ?  `${process.env.BASE_URL}${productDetails?.files?.[0]}` :`${process.env.BASE_URL}${productDetails?.thumbnail}` ;
     
     // const hoverMedias= productDetails?.files?.length >0 ?  `${process.env.BASE_URL}${productDetails?.files?.[1]}` : productDetails?.files?.length? `${process.env.BASE_URL}${productDetails?.files?.[0]}` :`${process.env.BASE_URL}${productDetails?.thumbnail}` ;
 const hoverMedias =productDetails?.hoverThumbnail?`${process.env.BASE_URL}${productDetails?.hoverThumbnail}`:`${process.env.BASE_URL}${productDetails?.thumbnail}`;
 const thumbnailMedia =productDetails?.thumbnail?`${process.env.BASE_URL}${productDetails?.thumbnail}`:`${process.env.BASE_URL}${productDetails?.thumbnail}`;
     
     return {
         id: productDetails?._id,
         medias: { type: "image", thumbnail: medias },
         hoverMedias: { type: "image", thumbnail: hoverMedias },
         thumbnail: { type: "image", thumbnail: thumbnailMedia },
         params: { slug: productDetails?.slug },
         attributes: productDetails?.attributes ? productDetails?.attributes : [],
         name: { text: productDetails?.name },
         overview: { text: productDetails?.overview },
         price: { text: `${settings?.currency} ${Number(productDetails?.price?.selling).toFixed(2)}` },
         // actualPrice: { text: `${settings?.currency} ${productDetails?.price?.mrp}` },
         actualPrice: { 
             text: productDetails?.price?.mrp === productDetails?.price?.selling 
                 ? null 
                 : `${settings?.currency} ${productDetails?.price?.mrp}` 
         },
         donationPercentage: { text: `${productDetails?.donationPercentage}% is Donated to Education` },
         percentageOff: message,
         inStock: productDetails?.stock > 0 ? true : false,
         category: productDetails?.category,
         x: hotspot?.x,
         y: hotspot?.y
     }
 }