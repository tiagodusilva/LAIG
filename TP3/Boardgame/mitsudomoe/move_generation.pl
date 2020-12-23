:- use_module(library(lists)).
:- use_module(library(sets)).

% Generate & get exposed rings
lambda_can_ball_be_placed(Player, Stack) :-
    can_ball_be_placed(Stack, Player).
get_exposed_ring(GameState, Player, ExposedRing) :-
    get_stack_if(GameState, [lambda_can_ball_be_placed, Player], ExposedRing).
get_exposed_rings(GameState, Player, ExposedRings) :-
    findall(ExposedRing, get_exposed_ring(GameState, Player, ExposedRing), ExposedRings).


% Generate & get player balls
lambda_has_player_ball(Player, Stack) :-
    last(Stack, Last),
    owns_ball(Player, Last).
get_player_ball(GameState, Player, Ball) :-
    get_stack_if(GameState, [lambda_has_player_ball, Player], Ball).
get_player_balls(GameState, Player, Balls) :-
    findall(Ball, get_player_ball(GameState, Player, Ball), Balls).


% Generate & get positions to place a ring
get_ring_placement_location(GameState, PossiblePosition) :-
    get_stack_if(GameState, [can_ring_be_placed], PossiblePosition).
get_ring_placement_locations(GameState, PossibleRingPositions) :-
    findall(PosPosition, get_ring_placement_location(GameState, PosPosition), PossibleRingPositions).


% Generate a ring placement
generate_ring_displacement(GameState, Player, [[-1, -1], RingTo]) :-
    get_remaining_player_rings(GameState, Player, RemainingRings),
    RemainingRings > 0,
    get_stack_if(GameState, [can_ring_be_placed], RingTo).

% Generate a ring movement (from cell A to cell B)
generate_ring_displacement(GameState, Player, [RingFrom, RingTo]) :-
    get_exposed_ring(GameState, Player, RingFrom),
    get_ring_placement_location(GameState, RingTo).

% Generates a valid move, consecutive calls with backtracking generates every different move only once
get_valid_move(GameState, Player, PossibleMove) :-
    generate_ring_displacement(GameState, Player, RingDisplacement),
    move_ring_phase(GameState, Player, RingDisplacement, RingPhaseGameState),
    get_exposed_ring(RingPhaseGameState, Player, ExposedRing),
    get_player_ball(GameState, Player, Ball),
    is_pos_different(ExposedRing, Ball),
    can_move_ball(RingPhaseGameState, Player, [Ball, ExposedRing], BallsToDisplace),
    get_enemy_relocation(RingPhaseGameState, Player, BallsToDisplace, EnemyRelocation),
    new_move(RingDisplacement, [Ball, ExposedRing], EnemyRelocation, Player, PossibleMove).

valid_moves(GameState, Player, ListOfMoves) :-
    findall(Move, get_valid_move(GameState, Player, Move), ListOfMoves).


% ENEMY BALL RELOCATION

% get_enemy_relocation(+GameState, +Player, +BallsToRelocate, -Relocations)
% If there are no balls to relocate, the output is an empty list
get_enemy_relocation(_, _, [], []) :- !.
% If balls need to be relocated, find a possible order of relocations
get_enemy_relocation(GameState, Player, BallsToRelocate, Relocations) :-
    next_player(Player, Enemy),
    get_exposed_rings(GameState, Enemy, EnemyExposedRings),
    append(EnemyExposedRings, BallsToRelocate, PossibleSpots),
    get_outcome(BallsToRelocate, PossibleSpots, Outcome),
    get_relocations_from_outcome(BallsToRelocate, Outcome, Relocations).

% Given a list of balls to relocate and their possible destinations,
% generate a list with their possible final locations
% get_outcome(+BallsToRelocate, +Spots, -Outcome) :-
get_outcome(BallsToRelocate, Spots, Outcome) :-
    length(BallsToRelocate, NumBalls),
    comb(NumBalls, Spots, Outcome),
    \+ are_lists_equal(BallsToRelocate, Outcome).

% From a given outcome, generate the relocations needed to 'perform' it
% get_relocations_from_outcome(+BallsToRelocate, +Outcome, -Relocations) :-
get_relocations_from_outcome(BallsToRelocate, Outcome, Relocations) :-
    % we can operate over these lists as an unordered set
    intersection(BallsToRelocate, Outcome, PriorityBalls),
    subtract(BallsToRelocate, PriorityBalls, RemainingBalls),
    subtract(Outcome, PriorityBalls, FreeSpots),
    outcome_relocate_balls(PriorityBalls, FreeSpots, Displacements1, RemainingSpots),
    outcome_relocate_balls(RemainingBalls, RemainingSpots, Displacements2, _),
    append(Displacements1, Displacements2, Relocations).


% outcome_relocate_balls(+PriotityBalls, +FreeSpots, -Displacements, -RemainingSpots).
outcome_relocate_balls([], FreeSpots, [], FreeSpots).
outcome_relocate_balls([Ball | Balls], [Spot | FreeSpots], [[Ball, Spot] | T], RemainingSpots) :-
    outcome_relocate_balls(Balls, [Ball | FreeSpots], T, RemainingSpots).
