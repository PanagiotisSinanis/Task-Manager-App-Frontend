Code Changes Overview
This branch implements major changes in the QuickEntryBar and TaskList components to improve time-tracking functions and the overall user experience.

1. QuickEntryBar Component
The QuickEntryBar code has been upgraded with the following enhancements:

Quick Entry Mode: An entry field labeled “What are you working on?” has been added. Users can now enter a description and, if no specific task is selected, the timer can be started. In this scenario, the “Start” button is replaced with a “Create & Start” button, which performs two functions: it creates a new task with the provided description and starts time tracking.

Local Storage Persistence: The project, task, and description fields are now saved in localStorage. This improves the user experience by retrieving the user’s state even after a page refresh.

onStopped Callback: A new prop called onStopped has been added to support integration with the parent component. This prop can be used to stop the timer, which, in turn, notifies the parent component and all other components on which this timer depends.

UI Improvements: The overall styling of the component is more modern, with a white background, rounded borders, and shadows.

2. TaskList Component
The TaskList component has been updated with new features:

Dynamic Refresh: Changes to the QuickEntryBar will now refresh the time entries list. For instance, after stopping a task, TaskList can invoke onRefresh to fetch the latest data.

Live Duration Tracking: The timer for an active entry has been enhanced. It now draws upon current_start_time to compute the duration in real time, adding it to the initial duration (if present), ensuring an accurate total time representation.

New Button Actions: “Delete” (with a DeleteOutlined icon) and “Restart” (with a PlayCircleOutlined icon) buttons have been added. These buttons will make backend calls to delete or restart a time entry.

Task Filtering: The visual cleanliness of the list is improved by filtering out entries with status: “auto” and title: “Add description”.

UI Upgrade: Ant Design components (Card, Flex, Row, Col, Tag, Tooltip) have been used to modernize the list’s visual refresh, organization, and aesthetics.
