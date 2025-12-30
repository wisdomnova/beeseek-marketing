-- Create contacts table (master contact list)
CREATE TABLE IF NOT EXISTS contacts (
  id SERIAL PRIMARY KEY,
  contact_id VARCHAR(100) UNIQUE NOT NULL,
  username VARCHAR(255) NOT NULL,
  business VARCHAR(255),
  social_media VARCHAR(100),
  profile_link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create manager_contacts table (assigns contacts to managers with 24hr rotation)
CREATE TABLE IF NOT EXISTS manager_contacts (
  id SERIAL PRIMARY KEY,
  manager_id INTEGER REFERENCES managers(id) ON DELETE CASCADE,
  contact_id INTEGER REFERENCES contacts(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours'),
  messaged BOOLEAN DEFAULT FALSE,
  converted BOOLEAN DEFAULT FALSE,
  rejected BOOLEAN DEFAULT FALSE,
  messaged_at TIMESTAMP WITH TIME ZONE,
  converted_at TIMESTAMP WITH TIME ZONE,
  rejected_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(manager_id, contact_id, assigned_at)
);

-- Create contact_history table (track all interactions)
CREATE TABLE IF NOT EXISTS contact_history (
  id SERIAL PRIMARY KEY,
  manager_id INTEGER REFERENCES managers(id) ON DELETE CASCADE,
  contact_id INTEGER REFERENCES contacts(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL, -- 'assigned', 'messaged', 'converted', 'rejected', 'expired'
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_manager_contacts_manager ON manager_contacts(manager_id);
CREATE INDEX IF NOT EXISTS idx_manager_contacts_expires ON manager_contacts(expires_at);
CREATE INDEX IF NOT EXISTS idx_manager_contacts_messaged ON manager_contacts(messaged);
CREATE INDEX IF NOT EXISTS idx_contact_history_manager ON contact_history(manager_id);
CREATE INDEX IF NOT EXISTS idx_contact_history_contact ON contact_history(contact_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_contacts_updated_at ON contacts;
CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON contacts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_manager_contacts_updated_at ON manager_contacts;
CREATE TRIGGER update_manager_contacts_updated_at BEFORE UPDATE ON manager_contacts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
