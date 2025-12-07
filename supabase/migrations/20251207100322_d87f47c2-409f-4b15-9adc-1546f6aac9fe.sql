-- Create transactions table
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  date DATE NOT NULL,
  amount NUMERIC NOT NULL CHECK (amount > 0),
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  approved_by TEXT[] NOT NULL,
  note TEXT,
  created_by TEXT NOT NULL DEFAULT 'admin_dblock',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_edited_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create edit_logs table
CREATE TABLE public.edit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_id UUID NOT NULL REFERENCES public.transactions(id) ON DELETE CASCADE,
  field_changed TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  edited_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  edited_by TEXT NOT NULL DEFAULT 'admin_dblock'
);

-- Enable Row Level Security
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.edit_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (residents can view all)
CREATE POLICY "Anyone can view transactions" 
ON public.transactions 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can view edit logs" 
ON public.edit_logs 
FOR SELECT 
USING (true);

-- Create policies for admin write access (using anon key for now since no auth)
CREATE POLICY "Allow insert transactions" 
ON public.transactions 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow update transactions" 
ON public.transactions 
FOR UPDATE 
USING (true);

CREATE POLICY "Allow delete transactions" 
ON public.transactions 
FOR DELETE 
USING (true);

CREATE POLICY "Allow insert edit logs" 
ON public.edit_logs 
FOR INSERT 
WITH CHECK (true);

-- Create function to update last_edited_at timestamp
CREATE OR REPLACE FUNCTION public.update_last_edited_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_edited_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_transactions_last_edited_at
BEFORE UPDATE ON public.transactions
FOR EACH ROW
EXECUTE FUNCTION public.update_last_edited_at();

-- Insert sample data
INSERT INTO public.transactions (type, date, amount, category, description, approved_by, created_by) VALUES
('income', CURRENT_DATE - INTERVAL '5 days', 150000, 'Maintenance', 'Monthly maintenance collection - May 2025', ARRAY['President', 'Treasurer'], 'admin_dblock'),
('expense', CURRENT_DATE - INTERVAL '10 days', 28500, 'Electricity', 'Common area electricity bill - May 2025', ARRAY['Secretary', 'Treasurer'], 'admin_dblock'),
('expense', CURRENT_DATE - INTERVAL '15 days', 35000, 'Security', 'Security guard salary - May 2025', ARRAY['President', 'Secretary'], 'admin_dblock'),
('expense', CURRENT_DATE - INTERVAL '20 days', 12000, 'Cleaning', 'Housekeeping staff salary - May 2025', ARRAY['Vice President'], 'admin_dblock'),
('income', CURRENT_DATE - INTERVAL '25 days', 148000, 'Maintenance', 'Monthly maintenance collection - April 2025', ARRAY['President', 'Treasurer'], 'admin_dblock'),
('expense', CURRENT_DATE - INTERVAL '30 days', 8500, 'Repair', 'Water tank cleaning and repair', ARRAY['President', 'Secretary', 'Treasurer'], 'admin_dblock'),
('expense', CURRENT_DATE - INTERVAL '35 days', 15000, 'Water', 'Water tanker charges - April 2025', ARRAY['Secretary'], 'admin_dblock'),
('expense', CURRENT_DATE - INTERVAL '40 days', 5000, 'Lift Maintenance', 'Quarterly lift maintenance', ARRAY['President', 'Treasurer'], 'admin_dblock'),
('income', CURRENT_DATE - INTERVAL '45 days', 25000, 'Festival', 'Holi celebration fund collection', ARRAY['Vice President', 'Secretary'], 'admin_dblock'),
('expense', CURRENT_DATE - INTERVAL '50 days', 22000, 'Festival', 'Holi celebration expenses', ARRAY['President', 'Vice President', 'Treasurer'], 'admin_dblock'),
('expense', CURRENT_DATE - INTERVAL '55 days', 3500, 'Gardening', 'Garden maintenance - plants and tools', ARRAY['Secretary'], 'admin_dblock'),
('income', CURRENT_DATE - INTERVAL '60 days', 152000, 'Maintenance', 'Monthly maintenance collection - March 2025', ARRAY['President', 'Treasurer'], 'admin_dblock');