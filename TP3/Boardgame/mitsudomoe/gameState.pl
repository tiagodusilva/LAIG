:- use_module(library(lists)).

% ------------------------
%   GAMESTATE DEFINITION
% ------------------------

initial(GameState) :-
    GameState = [
        [  % Game board
            [ [],     [],     [],  [2, 4], [2, 4]],
            [ [],     [],     [],  [],     [2, 4]],
            [ [],     [],     [],  [],     []],
            [ [1, 3], [],     [],  [],     []],
            [ [1, 3], [1, 3], [],  [],     []]
        ],
        5, % Unplayed white rings
        5, % Unplayed black rings
        3  % Shown Stack Size
    ].

mid_game(GameState) :-
    GameState = [
        [  % Game board
            [ [],     [],     [],        [2, 1], [1, 3]],
            [ [],     [1, 3], [],        [2, 4], [2, 4]],
            [ [],     [1],    [2, 1, 3], [2],    [1]],
            [ [2, 4], [2, 1], [2],       [],     []],
            [ [],     [],     [],        [],     []]
        ],
        1, % Unplayed white rings
        0, % Unplayed black rings
        4  % Shown Stack Size
    ].

end_game(GameState) :-
    GameState = [
        [  % Game board
            [ [],     [],     [],     [1, 2, 1, 3], [1, 3]],
            [ [],     [],     [],     [2, 4],       [2, 1, 3]],
            [ [],     [1],    [2, 1], [],           []],
            [ [2, 4], [2, 1], [2, 1], [],           []],
            [ [2, 4], [],     [],     [],           []]
        ],
        0, % Unplayed white rings
        0, % Unplayed black rings
        5  % Shown Stack Size
    ].


% PLAYER:
% black
% white

next_player(black, white).
next_player(white, black).

% STACK CONTENTS
% 1 : White Ring
% 2 : Black Ring
% 3 : White Ball
% 4 : Black Ball

owns_ring(white, 1).
owns_ring(black, 2).
owns_ball(white, 3).
owns_ball(black, 4).
    
is_ring(1).
is_ring(2).
is_ball(3).
is_ball(4).

is_pos_in_bounds(RowIndex, ColIndex) :-
    RowIndex >= 0,
    RowIndex < 5,
    ColIndex >= 0,
    ColIndex < 5.

% ------------------------
%    GAMESTATE GETTERS
% ------------------------
get_board([Board | _], Board).
get_white_rings([_, WhiteRings | _], WhiteRings).
get_black_rings([_, _, BlackRings | _], BlackRings).
get_shown_stack_size([_, _, _, ShownStackSize | _], ShownStackSize).

get_remaining_player_rings(GameState, white, RemainingRings) :-
    get_white_rings(GameState, RemainingRings).

get_remaining_player_rings(GameState, black, RemainingRings) :-
    get_black_rings(GameState, RemainingRings).

get_row(GameState, RowIndex, Row) :-
    get_board(GameState, Board),
    nth0(RowIndex, Board, Row).

get_stack(GameState, [RowIndex, ColIndex], Stack) :-
    get_row(GameState, RowIndex, Row),
    nth0(ColIndex, Row, Stack).

get_top_elem(GameState, Coords, TopElem) :-
    get_stack(GameState, Coords, Stack),
    last(Stack, TopElem).

get_top_elem_initial_cells(GameState, white, ElemList) :-
    get_board(GameState, Board),
    length(Board, NumRows),
    BottomRow is NumRows - 1,
    BeforeBottomRow is NumRows - 2,
    get_top_elem(GameState, [BeforeBottomRow, 0], Elem1),
    get_top_elem(GameState, [BottomRow, 0], Elem2),
    get_top_elem(GameState, [BottomRow, 1], Elem3),
    ElemList = [Elem1, Elem2, Elem3].

get_top_elem_initial_cells(GameState, black, ElemList) :-
    get_board(GameState, Board),
    nth0(0, Board, FirstRow),
    length(FirstRow, NumCols),
    LastCol is NumCols - 1,
    BeforeLastCol is NumCols - 2,
    get_top_elem(GameState, [0, BeforeLastCol], Elem1),
    get_top_elem(GameState, [0, LastCol], Elem2),
    get_top_elem(GameState, [1, LastCol], Elem3),
    ElemList = [Elem1, Elem2, Elem3].

get_initial_cells(GameState, black, CoordList) :-
    get_board(GameState, Board),
    nth0(0, Board, FirstRow),
    length(FirstRow, NumCols),
    LastCol is NumCols - 1,
    BeforeLastCol is NumCols - 2,
    CoordList = [[0, BeforeLastCol], [0, LastCol], [1, LastCol]].

get_initial_cells(GameState, white, CoordList) :-
    get_board(GameState, Board),
    length(Board, NumRows),
    BottomRow is NumRows - 1,
    BeforeBottomRow is NumRows - 2,
    CoordList = [[BeforeBottomRow, 0], [BottomRow, 0], [BottomRow, 1]].


% ------------------------
%     GET STACK IF
% ------------------------

% The following predicates are used to create the predicate get_stack_if and get_stacks_if
% Given a predicate list that will be appended a stack, in case the predicate is successful
% the position of that stack will be returned
% Successive calls with backtracking will result in all the stacks for which the predicate is true

get_stack_if_board([], _, _, _) :- !, fail.
get_stack_if_board([Row | _], PredicateList, CurPos, StackCoords) :-
    get_stack_if_row(Row, PredicateList, CurPos, StackCoords).
get_stack_if_board([_ | Board], PredicateList, [RowIndex, ColIndex], StackCoords) :-
    NextRow is RowIndex + 1,
    get_stack_if_board(Board, PredicateList, [NextRow, ColIndex], StackCoords).

get_stack_if_row([], _, _, _) :- !, fail.
get_stack_if_row([Stack | _], PredicateList, CurPos, CurPos) :-
    append(PredicateList, [Stack], FilledPredicate),
    P =.. FilledPredicate, P.
get_stack_if_row([_ | Row], PredicateList, [RowIndex, ColIndex], StackCoords) :-
    NextCol is ColIndex + 1,
    get_stack_if_row(Row, PredicateList, [RowIndex, NextCol], StackCoords).

get_stack_if(GameState, PredicateList, Coords) :-
    get_board(GameState, Board),
    get_stack_if_board(Board, PredicateList, [0, 0], Coords).

get_stacks_if(GameState, PredicateList, CoordList) :-
    findall(Coords, get_stack_if(GameState, PredicateList, Coords), CoordList).

% ------------------------
%     MOVE DEFINITION
% ------------------------

% Displace:
% from_row
% from_col
% to_row
% to_col

new_displace(FromRow, FromCol, ToRow, ToCol, [[FromRow, FromCol], [ToRow, ToCol]]).

new_displace(FromCoords, ToCoords, [FromCoords, ToCoords]).

get_displace_from_row(Displace, FromRow) :-
    nth0(0, Displace, FromCoords),
    nth0(0, FromCoords, FromRow).

get_displace_from_col(Displace, FromCol) :-
    nth0(0, Displace, FromCoords),
    nth0(1, FromCoords, FromCol).

get_displace_to_row(Displace, ToRow) :-
    nth0(1, Displace, ToCoords),
    nth0(0, ToCoords, ToRow).

get_displace_to_col(Displace, ToCol) :-
    nth0(1, Displace, ToCoords),
    nth0(1, ToCoords, ToCol).

% Move:
% ring_displace -> [-1, -1, pos, pos] if placing a ball
% ball_displace
% [balls_relocated]

new_move(RingDisplace, BallDisplace, BallRelocations, Player, [RingDisplace, BallDisplace, BallRelocations, Player]).

get_move_ring_displace(Move, RingDisplace) :-
    nth0(0, Move, RingDisplace).

get_move_ball_displace(Move, BallDisplace) :-
    nth0(1, Move, BallDisplace).

get_move_balls_relocated(Move, BallRelocations) :-
    nth0(2, Move, BallRelocations).

get_move_player(Move, Player) :-
    nth0(3, Move, Player).

% ------------------------
%         REPLACE
% ------------------------
replace_board(GameState, NewBoard, NewGameState) :-
    replace(GameState, 0, NewBoard, NewGameState).

replace_row(GameState, RowIndex, NewRow, NewGameState) :-
    get_board(GameState, Board),
    replace(Board, RowIndex, NewRow, NewBoard),
    replace_board(GameState, NewBoard, NewGameState).

replace_stack(GameState, [RowIndex, ColIndex], NewStack, NewGameState) :-
    get_row(GameState, RowIndex, Row),
    replace(Row, ColIndex, NewStack, NewRow),
    replace_row(GameState, RowIndex, NewRow, NewGameState).

replace_remaining_rings(GameState, white, NewRemainingRings, NewGameState) :-
    replace(GameState, 1, NewRemainingRings, NewGameState).

replace_remaining_rings(GameState, black, NewRemainingRings, NewGameState) :-
    replace(GameState, 2, NewRemainingRings, NewGameState).


% ------------------------
%         Checks
% ------------------------

%Checks for player colored balls on the enemy's starting cells
check_enemy_cells(GameState, Player) :-
    next_player(Player, Enemy),
    get_top_elem_initial_cells(GameState, Enemy, Cells),
    nth0(0, Cells, Elem1),
    nth0(1, Cells, Elem2),
    nth0(2, Cells, Elem3),
    owns_ball(Player, Elem1),
    owns_ball(Player, Elem2),
    owns_ball(Player, Elem3).


%Checks for any balls on the player initial houses
check_own_cells(GameState, Player) :-
    get_top_elem_initial_cells(GameState, Player, Cells),
    nth0(0, Cells, Elem1),
    nth0(1, Cells, Elem2),
    nth0(2, Cells, Elem3),
    is_ball(Elem1),
    is_ball(Elem2),
    is_ball(Elem3).


% ------------------------
%        GAME OVER
% ------------------------

% Does the player have all his home spots filled with ANY balls at the end of his turn
game_over_by_passive_play(GameState, Player) :-
    check_own_cells(GameState, Player).

% To check after each player finished their turn (Winner is white/black/none)
% game_over(+GameState, +Player, -Winner)
% Has the player reached the enemy's home spots
game_over(GameState, Player, Player) :-
    check_enemy_cells(GameState, Player), !.
% Does the player have all his home spots filled with ANY balls at the end of his turn
game_over(GameState, Player, Enemy) :-
    game_over_by_passive_play(GameState, Player), 
    next_player(Player, Enemy), !.
% Has the enemy player run out of moves
game_over(GameState, Player, Player) :-
    next_player(Player, Enemy),
    % Does the enemy still have at least one valid move?
    \+ get_valid_move(GameState, Enemy, _), !.
% No winner yet
game_over(_, _, none).

