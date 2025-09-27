-- Fix security warning by dropping and recreating the function with proper search path
DROP TRIGGER IF EXISTS set_proposal_expiry_trigger ON public.proposals;
DROP FUNCTION IF EXISTS public.set_proposal_expiry();

CREATE OR REPLACE FUNCTION public.set_proposal_expiry()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- Recreate the trigger
CREATE TRIGGER set_proposal_expiry_trigger
  BEFORE INSERT OR UPDATE ON public.proposals
  FOR EACH ROW
  EXECUTE FUNCTION public.set_proposal_expiry();