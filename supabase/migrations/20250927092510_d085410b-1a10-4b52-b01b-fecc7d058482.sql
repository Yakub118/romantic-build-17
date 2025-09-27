-- Add missing plan and expiry related columns to proposals table
ALTER TABLE public.proposals 
ADD COLUMN plan_type text NOT NULL DEFAULT 'freemium',
ADD COLUMN view_count integer NOT NULL DEFAULT 0,
ADD COLUMN view_limit integer NOT NULL DEFAULT 50,
ADD COLUMN payment_status text DEFAULT 'pending',
ADD COLUMN payment_id text DEFAULT NULL,
ADD COLUMN deploy_slots_used integer NOT NULL DEFAULT 0,
ADD COLUMN deploy_slots_total integer NOT NULL DEFAULT 0;

-- Create user_plans table to track user's plan limits and usage
CREATE TABLE public.user_plans (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    plan_type text NOT NULL DEFAULT 'freemium',
    microsites_created integer NOT NULL DEFAULT 0,
    microsites_limit integer NOT NULL DEFAULT 3,
    deploy_slots_used integer NOT NULL DEFAULT 0,
    deploy_slots_total integer NOT NULL DEFAULT 0,
    plan_expires_at timestamp with time zone DEFAULT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    UNIQUE(user_id)
);

-- Enable RLS on user_plans
ALTER TABLE public.user_plans ENABLE ROW LEVEL SECURITY;

-- Create policies for user_plans
CREATE POLICY "Users can view their own plan" 
ON public.user_plans 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own plan" 
ON public.user_plans 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own plan" 
ON public.user_plans 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create function to automatically set expiry based on plan type
CREATE OR REPLACE FUNCTION public.set_proposal_expiry()
RETURNS TRIGGER AS $$
BEGIN
  -- Set expiry based on plan type
  IF NEW.plan_type = 'freemium' THEN
    NEW.expires_at = now() + interval '24 hours';
    NEW.view_limit = 50;
  ELSIF NEW.plan_type = 'weekly' THEN
    NEW.expires_at = now() + interval '7 days';
    NEW.view_limit = NULL; -- No view limit for premium plans
  ELSIF NEW.plan_type = 'deploy' THEN
    NEW.expires_at = NULL; -- No expiry for deploy plan
    NEW.view_limit = NULL; -- No view limit for deploy plan
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically set expiry
CREATE TRIGGER set_proposal_expiry_trigger
  BEFORE INSERT OR UPDATE ON public.proposals
  FOR EACH ROW
  EXECUTE FUNCTION public.set_proposal_expiry();

-- Add trigger for updating user_plans updated_at
CREATE TRIGGER update_user_plans_updated_at
  BEFORE UPDATE ON public.user_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();