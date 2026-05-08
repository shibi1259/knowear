import { Suspense } from "react";
import { cookies } from "next/headers";
import { endpoints } from "./_constants/endpoints/endpoints";
import WidgetList from "./shared/widget-list/WidgetList";
import HomeLoading from "./loading";

export default function Home({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const page =
    typeof searchParams?.page === "string" ? Number(searchParams.page) : 1;
  const type = typeof searchParams?.type === "string" ? searchParams.type : "";

  return (
    <div>
      <Suspense fallback={<HomeLoading />}>
        <HomeWidgets page={page} type={type} />
      </Suspense>
    </div>
  );
}

async function HomeWidgets({ page, type }: { page: number; type: string }) {
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

  return <WidgetList data={data} />;
}

const getPublishedWidgets = async ({ page }: { page?: number }) => {
  try {
    const token = cookies().get("access_token")?.value;
    const device_token = cookies().get("device_token")?.value;
    const resp = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}published-widgets?page=${page}`,
      {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          Devicetoken: device_token || "",
        },
        next: { revalidate: 300, tags: ["home_widgets"] },
      }
    );

    if (!resp.ok) {
      throw new Error(`Failed to fetch published widgets: ${resp.status}`);
    }

    return resp?.json();
  } catch (error) {
    return { result: { widgets: [], isLastPage: true } };
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
          Devicetoken: device_token || "",
        },
        next: { revalidate: 300, tags: ["home_widgets"] },
      }
    );
    if (!resp.ok) {
      throw new Error(`Failed to fetch preview widgets: ${resp.status}`);
    }
    return resp?.json();
  } catch (error) {
    return { result: { widgets: [], isLastPage: true } };
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
          Devicetoken: device_token || "",
        },
        next: { revalidate: 300, tags: ["home_widgets"] },
      }
    );
    if (!resp.ok) {
      throw new Error(`Failed to fetch draft widgets: ${resp.status}`);
    }
    return resp?.json();
  } catch (error) {
    return { result: { widgets: [], isLastPage: true } };
  }
};
