-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- Notification details
  title VARCHAR NOT NULL,
  description TEXT,
  notification_type VARCHAR NOT NULL CHECK (notification_type IN ('vehicle_report', 'material_request')),
  
  -- Related data
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
  material_request_id UUID REFERENCES material_requests(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Recipient info - stored as app_role to notify all users with that role
  recipient_role app_role NOT NULL,
  
  -- Read status per user (NULL = unread)
  read_at TIMESTAMP WITH TIME ZONE,
  read_by UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Add indexes for better query performance
CREATE INDEX notifications_recipient_role_idx ON notifications(recipient_role);
CREATE INDEX notifications_created_at_idx ON notifications(created_at DESC);
CREATE INDEX notifications_read_at_idx ON notifications(read_at);
CREATE INDEX notifications_vehicle_id_idx ON notifications(vehicle_id);
CREATE INDEX notifications_material_request_id_idx ON notifications(material_request_id);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Admins can see all notifications
CREATE POLICY "Admins can view all notifications"
  ON notifications FOR SELECT
  USING (auth.jwt() ->> 'role' = 'admin');

-- Users can see notifications directed to their role
CREATE POLICY "Users can view notifications for their role"
  ON notifications FOR SELECT
  USING (
    recipient_role = (
      SELECT role FROM profiles WHERE user_id = auth.uid()
    )
  );

-- Users can view notifications they created
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (created_by = auth.uid());

-- Only authenticated users can create notifications
CREATE POLICY "Authenticated users can create notifications"
  ON notifications FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Users can update read status for notifications sent to them
CREATE POLICY "Users can mark notifications as read"
  ON notifications FOR UPDATE
  USING (
    recipient_role = (
      SELECT role FROM profiles WHERE user_id = auth.uid()
    )
    OR created_by = auth.uid()
  )
  WITH CHECK (
    recipient_role = (
      SELECT role FROM profiles WHERE user_id = auth.uid()
    )
    OR created_by = auth.uid()
  );
