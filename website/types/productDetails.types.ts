export type ProductMedia = {
    [x: string]: unknown;
    type: string;
    url: string;
    zoomimage: string;
};

type PercentageOff = {
    text: string;
};

type ProductText = {
    text: string;
};

export type Attribute = {
    _id: string;
    title: string;
    value: string;
};

export type AttributeItem = {
    values: string[];
    title: string;
};

export type Product = {
    params: {
        slug: string;
        _id: string;
    };
    thumbnail: string;
    hoverThumbnail: string;
    medias: ProductMedia[];
    sku: string;
    percentageOff: PercentageOff;
    save: ProductText
    name: ProductText;
    price: ProductText;
    actualPrice: ProductText;
    donationPercentage: ProductText;
    stock: string;
    inStock: boolean;
    overview: ProductText;
    description: ProductText;
    sizeChart: ProductText;
    returnPolicy: ProductText;
    parentId: string;
    attributes: Attribute[];
    attributeItems: AttributeItem[];
    relatedProducts: any[];
};
