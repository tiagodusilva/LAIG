% :- module('mitsudomoe', ['play.pl']).
:- ensure_loaded('display.pl').
:- ensure_loaded('gameState.pl').
:- ensure_loaded('utils.pl').
:- ensure_loaded('moves.pl').
:- ensure_loaded('input.pl').
:- ensure_loaded('move_generation.pl').
:- ensure_loaded('ai.pl').

:- use_module(library(system)).


% GAME MODE
mode(1, h-h).
mode(2, c-h).
mode(3, h-c).
mode(4, c-c).

play :-
    initial(GameState),
    print_title,
    print_legend,
    read_mode(ModeNumber, 4),
    mode(ModeNumber, Mode),
    read_level(Mode, Level),
    actual_game_loop(GameState, white, Mode, Level).


game_loop(GameState, Player, h-c, Level1-Level2) :-
    actual_game_loop(GameState, Player, c-h, Level2-Level1).
game_loop(GameState, Player, c-h, Level1-Level2) :-
    actual_game_loop(GameState, Player, h-c, Level2-Level1).
game_loop(GameState, Player, Mode, Level1-Level2) :-
    actual_game_loop(GameState, Player, Mode, Level2-Level1).


actual_game_loop(GameState, Player, Mode, Level) :-
    display_game(GameState, Player),
    pick_move(GameState, Player, Mode, Move, Level),
    try_move(GameState, Move, NextGameState),
    next_player(Player, NextPlayer),
    bot_sleep(Mode),
    game_over(NextGameState, Player, Winner),
    handle_winner(NextGameState, NextPlayer, Mode, Winner, Level).


bot_sleep(c-c) :-
    % true.
    sleep(1).
bot_sleep(_).

% Prints 'Impossible move' to the console in case an invalid move was attempted
try_move(GameState, Move, NewGameState) :-
    move(GameState, Move, NewGameState).
try_move(_, _, _) :-
    write('Impossible move!\n'),
    fail.

% handle_winner(+NextGameState, +NextPlayer, +Mode, +Winner, +Level) :-
handle_winner(NextGameState, NextPlayer, Mode, none, Level) :-
    game_loop(NextGameState, NextPlayer, Mode, Level).
handle_winner(GameState, NextPlayer, _, white, _) :-
    display_game(GameState, NextPlayer),
    write('White won!\n').
handle_winner(GameState, NextPlayer, _, black, _) :-
    display_game(GameState, NextPlayer),
    write('Black won!\n').


% pick_move(+GameState, +Player, +Mode, -Move, +Level)
pick_move(GameState, Player, h-h, Move, _) :-
    repeat,
    read_move(GameState, Player, Move).
pick_move(GameState, Player, h-c, Move, _) :-
    read_move(GameState, Player, Move).
pick_move(GameState, Player, c-c, Move, Level-_) :-
    choose_move(GameState, Player, Level, Move).
pick_move(GameState, Player, c-h, Move, Level-_) :-
    choose_move(GameState, Player, Level, Move).



% ------------------------
%      DEBUG ONLY
% ------------------------

% STACK CONTENTS
% 1 : White Ring
% 2 : Black Ring
% 3 : White Ball
% 4 : Black Ball

test_game(GameState) :-
    GameState = [
        [  % Game board
            [ [],     [],     [],  [2, 2, 4], [1]],
            [ [1],     [],     [],  [2, 4],     [2, 4]],
            [ [],     [],     [2, 4],  [],     [2]],
            [ [], [1, 3], [],  [],     []],
            [ [1, 3], [], [],  [],     []]
        ],
        0, % Unplayed white rings
        3, % Unplayed black rings
        3  % Shown Stack Size
    ].

print_list([]).
print_list([H | T]) :-
    write(H), nl,
    print_list(T).

print_all(Pred) :-
    append(Pred, [X], PL),
    P =.. PL, P,
    write(X), nl,
    fail.
print_all(_).

play_test :-
    test_game(GameState),
    print_all([get_valid_move, GameState, white]).
play_test(X) :-
    test_game(GameState),
    valid_moves(GameState, white, X).
