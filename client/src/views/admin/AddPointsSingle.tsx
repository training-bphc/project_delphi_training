import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { TrainingCategory } from '@/shared/types';
import './AddPointsSingle.css';

interface AddPointsSingleFormData {
  email_local: string;
  date: string;
  category_id: string;
  points: number;
  description?: string;
}

const EMAIL_DOMAIN = '@hyderabad.bits-pilani.ac.in';

const getTodayDateString = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

function AddPointsSingle() {
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [categories, setCategories] = useState<TrainingCategory[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [studentName, setStudentName] = useState<string | null>(null);

  const form = useForm<AddPointsSingleFormData>({
    defaultValues: {
      email_local: '',
      date: getTodayDateString(),
      category_id: '',
      points: 0,
      description: '',
    },
  });

  useEffect(() => {
    fetchCategories();
  }, [token]);

  // Watch for email changes and fetch student name
  useEffect(() => {
    const subscription = form.watch((value) => {
      const emailLocal = value.email_local?.trim();
      if (emailLocal) {
        fetchStudentName(emailLocal);
      } else {
        setStudentName(null);
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const fetchStudentName = async (emailLocal: string) => {
    try {
      const fullEmail = `${emailLocal}${EMAIL_DOMAIN}`;
      const response = await fetch(`/api/student?email=${encodeURIComponent(fullEmail)}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        setStudentName(null);
        return;
      }

      const data = await response.json();
      if (data.success && data.data && data.data.student_name) {
        setStudentName(data.data.student_name);
      } else {
        setStudentName(null);
      }
    } catch (error) {
      console.error('Failed to fetch student name:', error);
      setStudentName(null);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }

      const data = await response.json();
      const categoriesPayload: TrainingCategory[] = Array.isArray(data.data)
        ? data.data
        : Array.isArray(data.categories)
          ? data.categories
          : [];

      setCategories(categoriesPayload);
      if (categoriesPayload.length > 0) {
        form.setValue('category_id', String(categoriesPayload[0].category_id));
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const onSubmit = async (data: AddPointsSingleFormData) => {
    setIsSubmitting(true);

    try {
      const email = `${data.email_local.trim()}${EMAIL_DOMAIN}`;
      
      const response = await fetch('/api/records', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email_id: email,
          date: data.date,
          category_id: Number(data.category_id),
          points: Number(data.points),
          added_by: user?.email || 'admin',
          description: data.description || undefined,
        }),
      });

      if (!response.ok) {
        let errorMessage = 'Failed to add training points';
        try {
          const errorData = await response.json();
          console.error('[AddPointsSingle] Server error response:', errorData);
          errorMessage = errorData.message || errorMessage;
        } catch (parseError) {
          console.error('[AddPointsSingle] Failed to parse error response:', parseError);
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const responseData = await response.json();
      if (responseData.data?.pointsCapped) {
        toast.warning('Category limit reached. Points have been set to maximum capacity.');
      } else {
        toast.success('Training points added successfully!');
      }
      form.reset({
        email_local: '',
        date: getTodayDateString(),
        category_id: categories.length > 0 ? String(categories[0].category_id) : '',
        points: 0,
        description: '',
      });
      setTimeout(() => {
        navigate('/admin/training-points');
      }, 1500);
    } catch (error) {
      console.error('Error adding training points:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to add training points. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="addPointsSingleContent">
      <button className="backButton" onClick={() => navigate('/admin/add-training-points')}>
        ← Back
      </button>

      <div className="formContainer">
        <h1>Add Training Points for a Single Student</h1>
        <p className="formSubtitle">Enter the student's information and training details</p>

        <Form {...form}>
          <form 
            onSubmit={form.handleSubmit(onSubmit)} 
            className="addPointsSingleForm"
            onKeyPress={(e) => {
              const target = e.target as HTMLInputElement | HTMLTextAreaElement;
              if (e.key === 'Enter' && target.name !== 'description') {
                e.preventDefault();
              }
            }}
          >
            <FormField
              control={form.control}
              name="email_local"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Student Email</FormLabel>
                  <FormControl>
                    <div className="emailInputGroup">
                      <Input
                        placeholder="f202xyyyy"
                        {...field}
                        required
                        pattern="^[^@\s]+$"
                      />
                      <span className="emailDomain">{EMAIL_DOMAIN}</span>
                    </div>
                  </FormControl>
                  {studentName && <div className="studentNameDisplay">{studentName}</div>}
                  <FormDescription>Enter the student's ID or email prefix</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} required />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      required
                      className="categorySelect"
                    >
                      <option value="">Select a category</option>
                      {categories.map((category) => (
                        <option key={category.category_id} value={String(category.category_id)}>
                          {category.category_name}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="points"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Points</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      required
                      min={0}
                      step={1}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <textarea
                      placeholder="Add any additional notes about this training"
                      {...field}
                      className="descriptionTextarea"
                      rows={4}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isSubmitting} className="submitButton">
              {isSubmitting ? 'Adding Points...' : 'Add Points'}
            </Button>
          </form>
        </Form>
      </div>
    </main>
  );
}

export default AddPointsSingle;
