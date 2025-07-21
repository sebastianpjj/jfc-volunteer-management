require "test_helper"

class Api::EventsControllerTest < ActionDispatch::IntegrationTest
  test "should get index" do
    get api_events_index_url
    assert_response :success
  end

  test "should get show" do
    get api_events_show_url
    assert_response :success
  end
end
