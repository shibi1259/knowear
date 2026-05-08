import { cookies } from "next/headers";
import { endpoints } from "./_constants/endpoints/endpoints";
import WidgetList from "./shared/widget-list/WidgetList";

export default async function Home({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const page =
    typeof searchParams?.page === "string" ? Number(searchParams.page) : 1;
  const type = typeof searchParams?.type === "string" ? searchParams.type : "";

  let data;
  switch (type) {
    case "preview":
      data = await getPreviewWidgets({ page });
      break;
    case "draft":
      data = await getDraftWidgets({ page });
      break;
    default:
      data = await getPublishedWidgets({ page });
  }

  return (
    <div>
      <WidgetList data={data} />
    </div>
  );
}

const getPublishedWidgets = async ({ page }: { page?: number }) => {
  try {
    const token = cookies().get("access_token")?.value;
    const device_token = cookies().get("device_token")?.value;
console.log("process.env.NEXT_PUBLIC_API_URL",`${process.env.NEXT_PUBLIC_API_URL}${endpoints.publishedWidgets}?page=${page}`);

    const resp = await fetch(
      `https://api.knowear.me/api/v1/w/published-widgets?page=${page}`,
      {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          Devicetoken: `${device_token}`,
        },
        cache: "no-cache",
        next: { tags: ["home_widgets"] },
      }
    );
    console.log("resp?.json()",resp);
    
    return resp?.json();
  } catch (error) {
     console.log("Error caught in published widgets", error);
  }
};

const getPreviewWidgets = async ({ page }: { page?: number }) => {
  try {
    const token = cookies().get("access_token")?.value;
    const device_token = cookies().get("device_token")?.value;

    const resp = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}${endpoints.previewWidgets}?page=${page}`,
      {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          Devicetoken: `${device_token}`,
        },
        cache: "no-cache",
        next: { tags: ["home_widgets"] },
      }
    );
    return resp?.json();
  } catch (error) {
    console.log("Error caught in preview widgets", error);
  }
};

const getDraftWidgets = async ({ page }: { page?: number }) => {
  try {
    const token = cookies().get("access_token")?.value;
    const device_token = cookies().get("device_token")?.value;

    const resp = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}${endpoints.draftWidgets}?page=${page}`,
      {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          Devicetoken: `${device_token}`,
        },
        cache: "no-cache",
        next: { tags: ["home_widgets"] },
      }
    );
    return resp?.json();
  } catch (error) {
    console.log("Error caught in draft widgets", error);
  }
};
