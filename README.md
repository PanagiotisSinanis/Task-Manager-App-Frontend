 Summary of the Development Work 

This branch implements major changes in the `QuickEntryBar` and `TaskList` components in order to improve the time tracking functions and the overall user experience. --- ### 1. `QuickEntryBar` Component The `QuickEntryBar` code has been upgraded with the following enhancements: * **Quick Entry Mode:** For the entry called “What are you working on?”, there now exists an entry field. For users who provide a description but do not check a particular task, the timer can be triggered. In this scenario, the “Start” button is substituted with a “Create & Start” button which performs two functions: creating a task with the provided description and starting time tracking. * **Local Storage Persistence:** The project, task, and description fields are now saved in `localStorage.` This enhancement will improve user experience since the user’s state will be retrieved even after a page refresh. * **`onStopped` Callback:** An additional prop called `onStopped` has been added to support integration with the parent component. This prop can be used to stop the timer, which in turn, notifies the parent component and all other components on which this timer depends. * **UI Improvements:** The overall styling of the component is more modern, to include a white background, rounded borders, and shadows. 
2. TaskList Component

The TaskList component has been updated with new features:  

Dynamic Refresh: Changes to the QuickEntryBar will now refresh the time entries list. For instance, after stopping a task, TaskList can invoke onRefresh to fetch the latest data.  

Live Duration Tracking: The timer for an active entry has been enhanced. It now draws upon current_start_time to compute the duration in real time, adding to the initial duration (if present), ensuring an accurate total time representation.  

New Button Actions: The buttons “Delete” (with a DeleteOutlined icon) and “Restart” (with a PlayCircleOutlined icon) have been added. These buttons will make backend calls to delete or restart a time entry.  

Task Filtering: Improved visual cleanliness of the list is achieved by filtering out entries with status: “auto” and title: “Add description”.  

UI Upgrade: Ant Design components (Card, Flex, Row, Col, Tag, Tooltip) have been used to modernize the list’s visual refresh, and organization and aesthetics.

