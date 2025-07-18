# Requirements Document

## Introduction

This document outlines the requirements for "Smash Revenger" (スマッシュ・リベンジャー), a web-based tool for calculating guaranteed punish options in Super Smash Bros. Ultimate. The tool will help intermediate to advanced players determine which counterattacks are guaranteed after shielding specific moves, improving upon existing tools with enhanced functionality, multi-character comparison, and better user experience.

## Requirements

### Requirement 1

**User Story:** As a competitive Smash player, I want to select an attacking character and their move so that I can analyze punish opportunities against it.

#### Acceptance Criteria

1. WHEN the user accesses the main interface THEN the system SHALL display a character selection dropdown with all Ultimate fighters
2. WHEN a character is selected THEN the system SHALL load and display that character's moveset organized by categories (normal attacks, special moves, throws)
3. WHEN a move is selected THEN the system SHALL display the move's frame data including startup frames, total frames, and shield advantage
4. IF a move has variable frame data THEN the system SHALL display the range of possible values

### Requirement 2

**User Story:** As a player learning matchups, I want to select my defending character(s) so that I can see what punish options are available to me.

#### Acceptance Criteria

1. WHEN the user selects a defending character THEN the system SHALL load that character's complete moveset with frame data
2. WHEN multiple defending characters are selected THEN the system SHALL support comparison across all selected characters simultaneously
3. WHEN a defending character is selected THEN the system SHALL display their guard cancel options (jump, up-B, up-smash) with respective frame costs
4. IF no defending character is selected THEN the system SHALL prompt the user to make a selection before calculation

### Requirement 3

**User Story:** As a frame data analyst, I want the system to accurately calculate guaranteed punish options so that I can make informed decisions in matches.

#### Acceptance Criteria

1. WHEN calculation is triggered THEN the system SHALL use the formula: Shield Advantage + 1 >= Move Startup Frames
2. WHEN calculating punishes THEN the system SHALL consider guard cancel options (3F jump, 8F up-B, 11F up-smash)
3. WHEN calculating punishes THEN the system SHALL account for normal shield drop (11F) for ground options
4. WHEN moves have stale move negation applied THEN the system SHALL adjust shield advantage accordingly
5. IF a punish option exists THEN the system SHALL calculate and display the frame advantage window

### Requirement 4

**User Story:** As a tournament player, I want to see punish results organized and filtered so that I can quickly identify the most practical options.

#### Acceptance Criteria

1. WHEN results are displayed THEN the system SHALL sort punish options by startup frames (fastest first)
2. WHEN results are displayed THEN the system SHALL categorize moves by type (normal, special, throw)
3. WHEN results include kill moves THEN the system SHALL highlight these options visually
4. WHEN range filtering is enabled THEN the system SHALL filter results based on move range (short/medium/long)
5. IF no guaranteed punishes exist THEN the system SHALL clearly indicate this to the user

### Requirement 5

**User Story:** As a content creator, I want to export calculation results so that I can share findings with my community.

#### Acceptance Criteria

1. WHEN the user requests data export THEN the system SHALL provide CSV format download
2. WHEN the user requests data export THEN the system SHALL provide plain text format option
3. WHEN exporting data THEN the system SHALL include all relevant frame data and calculation parameters
4. IF no results exist THEN the system SHALL prevent export and display an appropriate message

### Requirement 6

**User Story:** As a mobile user, I want the tool to work seamlessly on my phone so that I can reference it during practice sessions.

#### Acceptance Criteria

1. WHEN accessed on mobile devices (320px+) THEN the system SHALL display a single-column vertical layout
2. WHEN accessed on tablets (768px+) THEN the system SHALL display a two-column layout
3. WHEN accessed on desktop (1024px+) THEN the system SHALL display a three-column layout
4. WHEN using touch interfaces THEN the system SHALL provide appropriately sized touch targets (44px minimum)
5. IF the device orientation changes THEN the system SHALL adapt the layout accordingly

### Requirement 7

**User Story:** As a user with accessibility needs, I want the tool to be fully accessible so that I can use it effectively regardless of my abilities.

#### Acceptance Criteria

1. WHEN navigating with keyboard only THEN the system SHALL provide full functionality access
2. WHEN using screen readers THEN the system SHALL provide appropriate ARIA labels and descriptions
3. WHEN distinguishing information THEN the system SHALL use methods beyond color alone (icons, text, patterns)
4. WHEN displaying text THEN the system SHALL maintain sufficient contrast ratios (WCAG AA compliance)
5. IF focus is moved programmatically THEN the system SHALL ensure focus visibility

### Requirement 8

**User Story:** As a user, I want the tool to load and respond quickly so that I can efficiently analyze multiple scenarios.

#### Acceptance Criteria

1. WHEN the application initially loads THEN the system SHALL complete loading within 3 seconds
2. WHEN performing calculations THEN the system SHALL return results within 100 milliseconds
3. WHEN switching between characters or moves THEN the system SHALL respond within 200 milliseconds
4. IF network conditions are poor THEN the system SHALL still function with cached data
5. WHEN loading large datasets THEN the system SHALL provide loading indicators

### Requirement 9

**User Story:** As a data-conscious user, I want to configure calculation parameters so that I can customize results for specific scenarios.

#### Acceptance Criteria

1. WHEN stale move negation is toggled THEN the system SHALL recalculate results with adjusted shield advantage values
2. WHEN range filtering is applied THEN the system SHALL only show moves within the selected range category
3. WHEN guard cancel options are toggled THEN the system SHALL include or exclude these options from calculations
4. IF custom parameters are set THEN the system SHALL remember these preferences for the session
5. WHEN parameters are changed THEN the system SHALL automatically recalculate and update results

### Requirement 10

**User Story:** As a competitive player, I want access to accurate and up-to-date frame data so that my analysis reflects the current game state.

#### Acceptance Criteria

1. WHEN displaying frame data THEN the system SHALL use verified data from Ultimate Frame Data and community sources
2. WHEN game updates affect frame data THEN the system SHALL be updatable with new values
3. WHEN displaying move properties THEN the system SHALL include startup, total frames, shield advantage, and range information
4. IF frame data conflicts exist between sources THEN the system SHALL prioritize the most recent verified data
5. WHEN data accuracy is uncertain THEN the system SHALL indicate this to users