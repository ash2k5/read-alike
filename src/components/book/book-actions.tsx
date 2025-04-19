
import { useState } from 'react';
import { useBookList } from '@/hooks/useBookList';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  BookOpen, 
  BookOpenCheck, 
  ChevronDown, 
  Loader2, 
  PlusCircle, 
  Trash 
} from 'lucide-react';
import { toast } from '@/components/ui/sonner';

interface BookActionsProps {
  bookId: string;
  compact?: boolean;
}

export function BookActions({ bookId, compact = false }: BookActionsProps) {
  const { user } = useSupabaseAuth();
  const { addToList, removeFromList, getBookStatus } = useBookList();
  const [isLoading, setIsLoading] = useState(false);
  
  const currentStatus = getBookStatus(bookId);
  
  if (!user) {
    return null;
  }
  
  const handleAddToList = async (status: 'reading' | 'want_to_read' | 'completed') => {
    setIsLoading(true);
    await addToList(bookId, status);
    setIsLoading(false);
  };
  
  const handleRemoveFromList = async () => {
    setIsLoading(true);
    await removeFromList(bookId);
    setIsLoading(false);
  };
  
  
  if (currentStatus) {
    const statusLabels = {
      'reading': 'Currently Reading',
      'want_to_read': 'Want to Read',
      'completed': 'Completed'
    };
    
    return (
      <div className={`${compact ? 'flex justify-center' : ''}`}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              size={compact ? "sm" : "default"} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : currentStatus === 'reading' ? (
                <BookOpen className="mr-2 h-4 w-4" />
              ) : currentStatus === 'completed' ? (
                <BookOpenCheck className="mr-2 h-4 w-4" />
              ) : (
                <PlusCircle className="mr-2 h-4 w-4" />
              )}
              {statusLabels[currentStatus]}
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem 
              onClick={() => handleAddToList('reading')}
              disabled={currentStatus === 'reading' || isLoading}
            >
              <BookOpen className="mr-2 h-4 w-4" />
              Move to Reading
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => handleAddToList('want_to_read')}
              disabled={currentStatus === 'want_to_read' || isLoading}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Move to Want to Read
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => handleAddToList('completed')}
              disabled={currentStatus === 'completed' || isLoading}
            >
              <BookOpenCheck className="mr-2 h-4 w-4" />
              Move to Completed
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={handleRemoveFromList}
              disabled={isLoading}
              className="text-red-500 focus:text-red-500"
            >
              <Trash className="mr-2 h-4 w-4" />
              Remove from List
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }
  
 
  return (
    <div className={`${compact ? 'flex justify-center' : ''}`}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size={compact ? "sm" : "default"} 
            disabled={isLoading}
            className={compact ? "w-full" : ""}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <PlusCircle className="mr-2 h-4 w-4" />
            )}
            Add to List
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem onClick={() => handleAddToList('reading')} disabled={isLoading}>
            <BookOpen className="mr-2 h-4 w-4" />
            Add to Reading
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleAddToList('want_to_read')} disabled={isLoading}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add to Want to Read
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleAddToList('completed')} disabled={isLoading}>
            <BookOpenCheck className="mr-2 h-4 w-4" />
            Mark as Completed
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
