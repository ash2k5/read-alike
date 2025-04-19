
import { useState } from "react";
import { Navbar } from "@/components/navbar";
import { BookGrid } from "@/components/book-grid";
import { BookOpen, Star, List, Settings, User as UserIcon } from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { useBookList } from "@/hooks/useBookList";
import { useUserProfile } from "@/hooks/useUserProfile";
import { books } from "@/data/mockData";
import { ProfileForm } from "@/components/profile/profile-form";
import { PreferencesForm } from "@/components/profile/preferences-form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const MyBooks = () => {
  const { user, loading: authLoading } = useSupabaseAuth();
  const { profile, loading: profileLoading } = useUserProfile();
  const { bookLists, loading: bookListsLoading } = useBookList();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-book-purple"></div>
      </div>
    );
  }
  
  if (!user && !authLoading) {
    return <Navigate to="/" />;
  }
  
  const userBookIds = bookLists.map(item => item.book_id);
  const userBooks = books.filter(book => userBookIds.includes(book.id));
  
  const readingBooks = books.filter(book => 
    bookLists.some(item => item.book_id === book.id && item.status === 'reading')
  );
  
  const wantToReadBooks = books.filter(book => 
    bookLists.some(item => item.book_id === book.id && item.status === 'want_to_read')
  );
  
  const completedBooks = books.filter(book => 
    bookLists.some(item => item.book_id === book.id && item.status === 'completed')
  );
  
  // Mock recommendations based on favorite genres in user profile
  const recommendedBooks = profile?.favorite_genres
    ? books.filter(book => 
        !userBookIds.includes(book.id) && 
        book.genre.some(g => profile.favorite_genres.includes(g.id))
      ).slice(0, 5)
    : [];
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User profile header */}
        <section className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={profile?.avatar_url} />
                <AvatarFallback className="bg-book-purple text-white text-xl">
                  {profile?.username?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{profile?.username || user?.email}</h1>
                <p className="text-gray-600">Book Explorer</p>
              </div>
            </div>
            
            <Collapsible open={isProfileOpen} onOpenChange={setIsProfileOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings size={16} className="mr-2" />
                  Profile Settings
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-4 p-6 border rounded-lg bg-white">
                <Tabs defaultValue="profile">
                  <TabsList className="mb-4">
                    <TabsTrigger value="profile">Profile</TabsTrigger>
                    <TabsTrigger value="preferences">Preferences</TabsTrigger>
                  </TabsList>
                  <TabsContent value="profile">
                    <ProfileForm />
                  </TabsContent>
                  <TabsContent value="preferences">
                    <PreferencesForm />
                  </TabsContent>
                </Tabs>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </section>
        
        {/* Main Tabs */}
        <Tabs defaultValue="all">
          <TabsList className="mb-8">
            <TabsTrigger value="all" className="flex items-center gap-1.5">
              <BookOpen size={18} />
              <span>All Books</span>
            </TabsTrigger>
            <TabsTrigger value="reading" className="flex items-center gap-1.5">
              <BookOpen size={18} />
              <span>Reading</span>
            </TabsTrigger>
            <TabsTrigger value="want-to-read" className="flex items-center gap-1.5">
              <List size={18} />
              <span>Want to Read</span>
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex items-center gap-1.5">
              <Star size={18} />
              <span>Completed</span>
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="flex items-center gap-1.5">
              <Star size={18} />
              <span>Recommendations</span>
            </TabsTrigger>
          </TabsList>
          
          {/* Content */}
          <TabsContent value="all">
            {bookListsLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-book-purple mx-auto mb-4"></div>
                <p>Loading your books...</p>
              </div>
            ) : userBooks.length > 0 ? (
              <BookGrid 
                books={userBooks} 
                title="My Books" 
                description="All books in your collection"
                variant="horizontal"
              />
            ) : (
              <EmptyBookList />
            )}
          </TabsContent>
          
          <TabsContent value="reading">
            {bookListsLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-book-purple mx-auto mb-4"></div>
                <p>Loading your books...</p>
              </div>
            ) : readingBooks.length > 0 ? (
              <BookGrid 
                books={readingBooks} 
                title="Currently Reading" 
                description="Books you're currently reading"
                variant="horizontal"
              />
            ) : (
              <EmptyBookList listType="reading" />
            )}
          </TabsContent>
          
          <TabsContent value="want-to-read">
            {bookListsLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-book-purple mx-auto mb-4"></div>
                <p>Loading your books...</p>
              </div>
            ) : wantToReadBooks.length > 0 ? (
              <BookGrid 
                books={wantToReadBooks} 
                title="Want to Read" 
                description="Books on your reading wishlist"
                variant="horizontal"
              />
            ) : (
              <EmptyBookList listType="want to read" />
            )}
          </TabsContent>
          
          <TabsContent value="completed">
            {bookListsLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-book-purple mx-auto mb-4"></div>
                <p>Loading your books...</p>
              </div>
            ) : completedBooks.length > 0 ? (
              <BookGrid 
                books={completedBooks} 
                title="Completed" 
                description="Books you've finished reading"
                variant="horizontal"
              />
            ) : (
              <EmptyBookList listType="completed" />
            )}
          </TabsContent>
          
          <TabsContent value="recommendations">
            {profileLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-book-purple mx-auto mb-4"></div>
                <p>Loading recommendations...</p>
              </div>
            ) : recommendedBooks.length > 0 ? (
              <BookGrid 
                books={recommendedBooks} 
                title="Recommended For You" 
                description="Based on your reading preferences and favorite genres"
                variant="default"
              />
            ) : (
              <div className="text-center py-12 bg-white rounded-xl shadow-sm">
                <Star size={48} className="mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">No recommendations yet</h3>
                <p className="text-gray-600 mb-6">Add some favorite genres in your profile preferences</p>
                <Button onClick={() => setIsProfileOpen(true)}>
                  <Settings size={16} className="mr-2" />
                  Open Preferences
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-500 text-sm">
              © 2025 ReadAlike. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

function EmptyBookList({ listType = "reading list" }: { listType?: string }) {
  return (
    <div className="text-center py-12 bg-white rounded-xl shadow-sm">
      <List size={48} className="mx-auto mb-4 text-gray-400" />
      <h3 className="text-xl font-medium text-gray-900 mb-2">
        {`Your ${listType} is empty`}
      </h3>
      <p className="text-gray-600 mb-6">Start exploring and add books to your list</p>
      <Link 
        to="/browse"
        className="inline-flex bg-book-purple hover:bg-book-purple-dark text-white font-medium px-4 py-2 rounded-lg transition"
      >
        Browse Books
      </Link>
    </div>
  );
}

function Button({ 
  children, 
  variant = "default",
  size = "default",
  onClick,
}: { 
  children: React.ReactNode;
  variant?: "default" | "outline";
  size?: "default" | "sm";
  onClick?: () => void;
}) {
  const baseClasses = "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background";
  
  const variantClasses = {
    default: "bg-book-purple text-white hover:bg-book-purple-dark",
    outline: "border border-input hover:bg-accent hover:text-accent-foreground"
  };
  
  const sizeClasses = {
    default: "h-10 py-2 px-4 rounded-md",
    sm: "h-9 px-3 rounded-md text-sm"
  };
  
  const className = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`;
  
  return (
    <button className={className} onClick={onClick}>
      {children}
    </button>
  );
}

export default MyBooks;
