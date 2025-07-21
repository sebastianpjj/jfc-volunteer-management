require "test_helper"

class Api::RegistrationsControllerTest < ActionDispatch::IntegrationTest
  test "should get create" do
    get api_registrations_create_url
    assert_response :success
  end
end
