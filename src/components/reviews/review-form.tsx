
import { useState } from 'react';
import { useReviews } from '@/hooks/useReviews';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Rating } from '@/components/ui/rating';
import { Loader2, Star } from 'lucide-react';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const reviewSchema = z.object({
  rating: z.number().min(1, "Please select a rating").max(5),
  reviewText: z.string().min(10, "Review must be at least 10 characters")
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

interface ReviewFormProps {
  bookId: string;
}

export function ReviewForm({ bookId }: ReviewFormProps) {
  const { user } = useSupabaseAuth();
  const { userReview, addReview, deleteReview } = useReviews(bookId);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedRating, setSelectedRating] = useState<number>(userReview?.rating || 0);
  
  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: userReview?.rating || 0,
      reviewText: userReview?.review_text || ''
    },
    values: {
      rating: userReview?.rating || 0,
      reviewText: userReview?.review_text || ''
    }
  });
  
  async function onSubmit(data: ReviewFormValues) {
    if (!user) return;
    
    setIsSubmitting(true);
    await addReview(bookId, data.rating, data.reviewText);
    setIsSubmitting(false);
  }
  
  async function handleDelete() {
    if (!userReview) return;
    
    setIsSubmitting(true);
    await deleteReview(userReview.id);
    setIsSubmitting(false);
    
    form.reset({
      rating: 0,
      reviewText: ''
    });
    setSelectedRating(0);
  }
  
  if (!user) {
    return (
      <div className="rounded-lg border p-4 text-center">
        <p className="mb-4">Please sign in to leave a review</p>
        <Button variant="outline">Sign In</Button>
      </div>
    );
  }
  
  const handleRatingChange = (newRating: number) => {
    setSelectedRating(newRating);
    form.setValue('rating', newRating, { shouldValidate: true });
  };
  
  return (
    <div className="rounded-lg border p-6">
      <h3 className="text-lg font-medium mb-4">
        {userReview ? 'Update Your Review' : 'Write a Review'}
      </h3>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="rating"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Your Rating</FormLabel>
                <FormControl>
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        type="button"
                        onClick={() => handleRatingChange(rating)}
                        className="focus:outline-none"
                      >
                        <Star 
                          className={`h-8 w-8 ${
                            rating <= selectedRating 
                              ? 'text-yellow-400 fill-yellow-400' 
                              : 'text-gray-300'
                          }`} 
                        />
                      </button>
                    ))}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="reviewText"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Your Review</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Share your thoughts about this book..."
                    className="min-h-32"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="flex space-x-2 justify-end">
            {userReview && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleDelete}
                disabled={isSubmitting}
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Delete Review
              </Button>
            )}
            
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {userReview ? 'Update Review' : 'Submit Review'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
