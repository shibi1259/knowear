type Media = {
    type: string;
    thumbnail: string;
};

type Attribute = {
    _id: string;
    title: string;
    value: string;
};

type ProductText = {
    text: string;
};

export type ProductCardProps = {
    medias: Media;
    hoverMedias: Media;
    thumbnail: Media;
    params: {
        slug: string;
    };
    isCart?: boolean;
    wishlist?: boolean;
    attributes: Attribute[];
    name: ProductText;
    overview: ProductText;
    price: ProductText;
    actualPrice: ProductText;
    donationPercentage: ProductText;
    percentageOff: ProductText;
    inStock: boolean;
};

export type ProductCartProps = {
    medias: Media;
    hoverMedias: Media;
    params: { slug: string };
    attributes: Attribute[];
    name: ProductText;
    overview: ProductText;
    price: ProductText;
    actualPrice: ProductText;
    donationPercentage: ProductText;
    percentageOff: ProductText;
    inStock: boolean;
    quantity: number;
};
