# User Guide

This guide specifies the features we attempted to implement as a team, as well as how they were tested.

## Feature: marking posts resolved/unresolved

### Overview

The user story we chose to address is: As a member of the course staff, I want some way to mark questions as resolved or unresolved regardless of if that question was answered, so that I can make sure to give help to all students who asked a question. 

Thus, the feature we implemented is a button by each post that marks it either as resolved or unresolved. When a post gets made, the button is automatically set to 'unresolved', since the question has not received an answer. When someone makes a first reply to the post, the button is automatically changed to 'resolved'. However, users can always manually change the 'resolved' status of their post, depending on if they were satisfied with the response or have any follow-up questions. 

The 'resolved' status of each post is also made very visible on the discussion board, with tags indicating if the post has been resolved without someone having to click into it. 

### User Test

A user can test and use this feature by:
1. Creating an account
2. Making a post 
3. Respond to the post, or have someone else respond to it
4. Click on the 'Mark resolved' or 'Mark unresolved' button at any point after the post is made. 

A video of this process can be viewed here: https://github.com/CMU-313/nodebb-f24-team-kale/pull/33

### Automated Tests

Unit tests in the test folder for the backend api functions implemented for this feature can be viewed here: https://github.com/CMU-313/nodebb-f24-team-kale/pull/29

These tests cover all backend API functions that were implemented for this feature: the two functions are in file src/api/topics.js, and they toggle the data scheme ‘resolved’ field from true to false and vice versa. The code for these functions can be found here: https://github.com/CMU-313/nodebb-f24-team-kale/pull/15 
Other than making changes to the database schema, these functions, which rely on the database schema, are the only backend changes made. Thus, only these two functions need to be tested using automated unit tests. A successful run of the tests can be found here: https://github.com/CMU-313/nodebb-f24-team-kale/actions/runs/10984399635/attempts/2 
And the code coverage report, after the unit tests were added, can be found here: https://coveralls.io/builds/70060631 

All other codebase changes were in the frontend and bridging the connections between frontend and backend. Those elements were all tested with manual user testing, as detailed above. 

Note that the test suite does fail in GitHub Actions for our last pull request (https://github.com/CMU-313/nodebb-f24-team-kale/pull/33). However, none of the failed errors are in files or on tests remotely related to what we our implementing. Our feature and the website still functions as normal. We think these failed tests potentially have to do with some configuration change or cache issues unrelated to the implementation of our feature. 

## Feature: making anonymous posts

### Overview

Another user story we chose to address is: As a student, I want to be able to post questions anonymously, so I won't be afraid to be judged.

After going through a couple design possibilities, we decided to create a separate button on the front end for posting anonymously, and attempted to hide the username on the post from the frontend as well. However, we soon realized that integration for the Resolved/Unresolved feature was more difficult than we originally thought, so all of our team members chose to focus our attention back on that feature first. 

