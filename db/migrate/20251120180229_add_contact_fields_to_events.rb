class AddContactFieldsToEvents < ActiveRecord::Migration[7.2]
  def change
    add_column :events, :contact_email, :string, default: 'event@eintracht-feldberg.de'
    add_column :events, :contact_tel, :string
  end
end
