:- use_module(library(lists)).
:- use_module(library(random)).


% value(+GameState, +Player, -Value)
% Return a value for the board
% At the moment only takes into account the distance of the player's balls to the final cells
value(GameState, Player, Value) :-
    check_own_cells(GameState, Player),
    Value is 9998.
value(GameState, Player, Value) :-
    check_enemy_cells(GameState, Player),
    Value is -9998.
value(GameState, Player, Value) :-
    get_stacks_if(GameState, [lambda_has_player_ball, Player], StackCoords),
    ball_distance_score(GameState, Player, StackCoords, Value).

% ball_distance_score(+GameState, +Player, +BallCoords, -Score)
% Returns the average of the distane of each ball to each final spot
ball_distance_score(GameState, Player, BallCoords, Score) :-
    next_player(Player, Enemy),
    get_initial_cells(GameState, Enemy, CoordList),
    nth0(0, BallCoords, Ball1),
    nth0(1, BallCoords, Ball2),
    nth0(2, BallCoords, Ball3),
    maplist(dist, [Ball1, Ball1, Ball1], CoordList, Dists1),
    maplist(dist, [Ball2, Ball2, Ball2], CoordList, Dists2),
    maplist(dist, [Ball3, Ball3, Ball3], CoordList, Dists3),
    avg(Dists1, Avg1),
    avg(Dists2, Avg2),
    avg(Dists3, Avg3),
    sumlist([Avg1, Avg2, Avg3], Score).

% Makes the random AI never commit suicide
% The AI will never block when there are only suicidal moves
% available, because in that case it will randomly choose from any of the
% suicidal options available
attempt_avoid_suicide(GameState, Player, ListOfMoves, Move) :-
    attempt_avoid_suicide_aux(GameState, Player, ListOfMoves, Move).
% We think the following scenario SHOULD be impossible, but we are not sure
attempt_avoid_suicide(_, _, ListOfMoves, Move) :-
    write('Cannot avoid suicide... I concede!'),
    random_member(Move, ListOfMoves).

% If the move would result in a suicide, it will select another ball
attempt_avoid_suicide_decision(GameState, NewGameState, Player, Residue, _, FinalMove) :-
    game_over_by_passive_play(NewGameState, Player), !,
    attempt_avoid_suicide_aux(GameState, Player, Residue, FinalMove), !.
% Found a move that does not end up in suicide, so it will use that move
attempt_avoid_suicide_decision(_, NewGameState, Player, _, Move, Move) :-
    \+ game_over_by_passive_play(NewGameState, Player).

% Selects different moves until there are no more moves available
attempt_avoid_suicide_aux(GameState, Player, ListOfMoves, FinalMove) :-
    !, \+ length(ListOfMoves, 0),
    random_select(Move, ListOfMoves, Residue),
    move(GameState, Move, NewGameState),
    attempt_avoid_suicide_decision(GameState, NewGameState, Player, Residue, Move, FinalMove).

% Random AI: Will randomly choose any non-suicidal option
choose_move(GameState, Player, random, Move) :-
    valid_moves(GameState, Player, ListOfMoves),
    attempt_avoid_suicide(GameState, Player, ListOfMoves, Move).

% Smart AI: Chooses the most optimal move possible (according to the provided value function)
choose_move(GameState, Player, smart, Move) :-
    valid_moves(GameState, Player, ListOfMoves),
    write('Possible Moves: '),
    length(ListOfMoves, NumMoves),
    write(NumMoves),
    nl,
    % get best move
    min_map(ListOfMoves, [lambda_evaluate_move, GameState, Player], Move).

% Predicate passed to min_map to translate a Move into a numerical Value for optimization
lambda_evaluate_move(GameState, Player, Move, Value) :-
    move(GameState, Move, NewGameState),
    value(NewGameState, Player, ValuePlayer),
    next_player(Player, NextPlayer),
    value(NewGameState, NextPlayer, ValueEnemy),
    random(-0.25, 0.25, Rand),
    Value is ValuePlayer + ValueEnemy * 0.5 + Rand. % Rand is used to make the AI not deterministic
    % Value is ValuePlayer + ValueEnemy * 0.5.

