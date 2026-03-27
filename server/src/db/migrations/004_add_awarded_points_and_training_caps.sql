ALTER TABLE hackathon_submissions
ADD COLUMN IF NOT EXISTS awarded_points INTEGER;

ALTER TABLE hackathon_submissions
ADD CONSTRAINT hs_awarded_points_non_negative_chk
CHECK (awarded_points IS NULL OR awarded_points >= 0);

CREATE OR REPLACE FUNCTION enforce_training_points_category_cap()
RETURNS TRIGGER AS $$
DECLARE
  category_limit INTEGER;
  existing_verified_total INTEGER;
BEGIN
  IF NEW.deleted_at IS NOT NULL OR NEW.verification_status <> 'Verified' THEN
    RETURN NEW;
  END IF;

  SELECT max_points
  INTO category_limit
  FROM training_point_categories
  WHERE category_id = NEW.category_id
  LIMIT 1;

  IF category_limit IS NULL THEN
    RAISE EXCEPTION 'Category % not found for points validation', NEW.category_id;
  END IF;

  SELECT COALESCE(SUM(points), 0)
  INTO existing_verified_total
  FROM training_points
  WHERE bits_id = NEW.bits_id
    AND category_id = NEW.category_id
    AND verification_status = 'Verified'
    AND deleted_at IS NULL
    AND s_no <> COALESCE(NEW.s_no, -1);

  IF existing_verified_total + COALESCE(NEW.points, 0) > category_limit THEN
    RAISE EXCEPTION
      'Assigned points exceed category limit for % (max %, current %, attempted %)',
      NEW.bits_id,
      category_limit,
      existing_verified_total,
      COALESCE(NEW.points, 0)
      USING ERRCODE = '23514';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_enforce_training_points_category_cap ON training_points;

CREATE TRIGGER trg_enforce_training_points_category_cap
BEFORE INSERT OR UPDATE OF points, category_id, bits_id, verification_status, deleted_at
ON training_points
FOR EACH ROW
EXECUTE FUNCTION enforce_training_points_category_cap();
