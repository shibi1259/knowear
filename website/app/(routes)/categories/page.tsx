import { cookies } from "next/headers";
import * as React from "react";

import { endpoints } from "@/app/_constants/endpoints/endpoints";
import CategoryList from "@/app/shared/category/CategoryList";



const Categories: React.FC = async () => {
  const categories = await getCategoryList();

  return (
    <div>
      
      <div className="pb-35px ">
        <div className="container mx-auto ">
          <div className="flex flex-col md:px-0 py-1 ">
           <CategoryList categories={categories?.result}/>
          </div>
        </div>

      </div>
    </div>
  )
};

export default Categories;


const getCategoryList = async () => {
  const deviceToken = cookies().get("device_token")?.value;
  const token = cookies().get("access_token")?.value;
  
const categories = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoints.categoriesList}`, {
  method: 'POST',
  cache:'no-cache',
  headers: {
    'Content-Type': 'application/json',
    'Devicetoken': deviceToken ?? '',
    'Authorization': token ? `Bearer ${token}` : '',
  },
  body: JSON.stringify({ page:1,limit:12 })
})

  return categories.json();
}