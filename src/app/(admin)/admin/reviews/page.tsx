import { createClient } from "@/app/utils/supabase/server";
import Reviews from "@/components/AdminComponents/review/Reviews";

export default async function ReviewsPage() {
  const supabase = await createClient();
  
  const { data: reviewsData, error } = await supabase
    .from("reviews")
    .select(
      `
      *,
      products(*),
      users(*),
      review_images(*)
    `
    )
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) {
    console.error("Error fetching reviews:", error);
    return (
      <div className="w-full p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error fetching reviews: {error.message}</p>
        </div>
      </div>
    );
  }

  return <Reviews initialReviews={reviewsData ?? []} />;
}
