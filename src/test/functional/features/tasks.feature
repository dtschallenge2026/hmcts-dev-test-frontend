Feature: Task management

  Scenario: Viewing the task list page
    Given I go to "/tasks"
    Then the page should include "Tasks"

  Scenario: Successfully creating a task
    Given I go to "/tasks/new"
    Then the page should include "Create a new task"
    When I fill in the field "title" with "Functional test task"
    And I fill in the field "due-day" with "15"
    And I fill in the field "due-month" with "6"
    And I fill in the field "due-year" with "2026"
    And I fill in the field "due-hour" with "09"
    And I fill in the field "due-minute" with "00"
    And I click the button "Create task"
    Then the page URL should be "/tasks"
    And the page should include "Functional test task"

  Scenario: Showing errors when date fields contain text
    Given I go to "/tasks/new"
    When I fill in the field "title" with "Test task"
    And I fill in the field "due-day" with "abc"
    And I fill in the field "due-month" with "6"
    And I fill in the field "due-year" with "2026"
    And I fill in the field "due-hour" with "09"
    And I fill in the field "due-minute" with "00"
    And I click the button "Create task"
    Then the page should include "There is a problem"
    And the page should include "Enter a valid day"

  Scenario: Showing error when day does not exist in the given month
    Given I go to "/tasks/new"
    When I fill in the field "title" with "Test task"
    And I fill in the field "due-day" with "31"
    And I fill in the field "due-month" with "6"
    And I fill in the field "due-year" with "2026"
    And I fill in the field "due-hour" with "09"
    And I fill in the field "due-minute" with "00"
    And I click the button "Create task"
    Then the page should include "There is a problem"
    And the page should include "The day does not exist in that month"
