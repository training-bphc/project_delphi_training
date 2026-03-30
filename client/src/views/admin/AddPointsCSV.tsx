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
import './AddPointsCSV.css';

interface AddPointsCSVFormData {
  date: string;
  category_id: string;
  points: number;
  description?: string;
}

const getTodayDateString = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

function AddPointsCSV() {
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [categories, setCategories] = useState<TrainingCategory[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emails, setEmails] = useState<string[]>([]);
  const [fileError, setFileError] = useState<string>('');

  const form = useForm<AddPointsCSVFormData>({
    defaultValues: {
      date: getTodayDateString(),
      category_id: '',
      points: 0,
      description: '',
    },
  });

  useEffect(() => {
    fetchCategories();
  }, [token]);

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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileError('');

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').map((line) => line.trim());
        const emailList = lines.filter((line) => line.length > 0 && line.includes('@'));

        if (emailList.length === 0) {
          setFileError('No valid emails found in file');
          return;
        }

        setEmails(emailList);
        setFileError('');
      } catch (error) {
        setFileError('Error reading file');
      }
    };
    reader.readAsText(file);
  };

  const onSubmit = async (data: AddPointsCSVFormData) => {
    if (emails.length === 0) {
      setFileError('Please upload a CSV file with email addresses');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/records/bulk-add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          emails,
          category_id: Number(data.category_id),
          points: Number(data.points),
          added_by: user?.email || 'admin',
          description: data.description || undefined,
        }),
      });

      if (!response.ok) {
        let errorMessage = 'Bulk upload failed';
        try {
          const error = await response.json();
          errorMessage = error.message || errorMessage;
        } catch {
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const responseData = await response.json();
      const result = responseData.data as {
        success: number;
        failed: number;
        cappedCount?: number;
        errors?: Array<{ email: string; error: string }>;
      };

      let message = `Successfully added ${result.success} records. ${result.failed} failed.`;
      if (result.failed > 0 && result.errors && result.errors.length > 0) {
        const errorLines = result.errors
          .slice(0, 10)
          .map((entry) => `- ${entry.email}: ${entry.error}`)
          .join('\n');
        message += `\n\nFailed emails:\n${errorLines}`;

        if (result.errors.length > 10) {
          message += `\n...and ${result.errors.length - 10} more`;
        }
      }

      if ((result.cappedCount ?? 0) > 0) {
        toast.warning(`${result.cappedCount} student(s) hit category limit. Points set to maximum capacity.`);
      }
      toast.success(message);
      setEmails([]);
      form.reset({
        date: getTodayDateString(),
        category_id: categories.length > 0 ? String(categories[0].category_id) : '',
        points: 0,
        description: '',
      });
      setTimeout(() => {
        navigate('/admin/training-points');
      }, 1500);
    } catch (error: any) {
      console.error('Error uploading CSV:', error);
      const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Upload failed: ${errorMsg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="addPointsCSVContent">
      <button className="backButton" onClick={() => navigate('/admin/add-training-points')}>
        ← Back
      </button>

      <div className="formContainer">
        <h1>Add Training Points from CSV</h1>
        <p className="formSubtitle">Upload a CSV file with student emails and assign training points in bulk</p>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="addPointsCSVForm">
            <FormItem>
              <FormLabel>CSV File</FormLabel>
              <FormControl>
                <div className="fileUploadContainer">
                  <input
                    type="file"
                    accept=".csv,.txt"
                    onChange={handleFileUpload}
                    disabled={isSubmitting}
                    id="csvFile"
                    className="fileInput"
                  />
                  <label htmlFor="csvFile" className="fileLabel">
                    {emails.length > 0 ? `✓ ${emails.length} emails loaded` : 'Choose CSV File'}
                  </label>
                </div>
              </FormControl>
              <FormDescription>Upload a CSV or TXT file with one email address per line</FormDescription>
              {fileError && <div className="errorMessage">{fileError}</div>}
            </FormItem>

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
                  <FormDescription>Points to assign to each student</FormDescription>
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

            <Button type="submit" disabled={isSubmitting || emails.length === 0} className="submitButton">
              {isSubmitting ? 'Uploading...' : 'Add Points to All'}
            </Button>
          </form>
        </Form>
      </div>
    </main>
  );
}

export default AddPointsCSV;
