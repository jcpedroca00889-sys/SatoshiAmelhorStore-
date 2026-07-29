export interface Review {
  id: string;
  orderId: string;
  productId: string;
  customerName: string;
  rating: number;
  title: string;
  content: string;
  createdAt: string;
}

const REVIEWS_KEY = "satoshi_store_reviews";

export function loadReviews(): Review[] {
  try {
    const raw = localStorage.getItem(REVIEWS_KEY);
    if (raw) return JSON.parse(raw) as Review[];
  } catch {
    /* ignore */
  }
  return [];
}

export function saveReviews(reviews: Review[]) {
  localStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews));
}

export function getReviewsForProduct(productId: string): Review[] {
  return loadReviews()
    .filter((r) => r.productId === productId)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
}

export function addReview(
  review: Omit<Review, "id" | "createdAt">
): Review {
  const newReview: Review = {
    ...review,
    id: "rev-" + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
    createdAt: new Date().toISOString(),
  };
  const reviews = loadReviews();
  reviews.unshift(newReview);
  saveReviews(reviews);
  return newReview;
}

export function getAverageRatingForProduct(productId: string): {
  average: number;
  count: number;
} {
  const reviews = getReviewsForProduct(productId);
  if (reviews.length === 0) return { average: 0, count: 0 };
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return { average: Math.round((sum / reviews.length) * 10) / 10, count: reviews.length };
}

export function hasUserReviewedProduct(
  email: string,
  productId: string
): boolean {
  return loadReviews().some(
    (r) =>
      r.customerName.toLowerCase() === email.toLowerCase() &&
      r.productId === productId
  );
}
