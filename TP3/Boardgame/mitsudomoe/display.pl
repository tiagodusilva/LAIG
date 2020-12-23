:- use_module(library(lists)).

put_code_n_times(_, 0).
put_code_n_times(Code, Times) :-
    put_code(Code),
    NextTimes is Times - 1,
    put_code_n_times(Code, NextTimes).


put_char_n_times(_, 0).
put_char_n_times(Char, Times) :-
    put_char(Char),
    NextTimes is Times - 1,
    put_char_n_times(Char, NextTimes).


print_number_with_padding(Number, _) :-
    Number > 10,
    X is Number // 10,
    Y is Number rem 10,
    digit_code(X, Code1),
    digit_code(Y, Code2),
    put_code(Code1),
    put_code(Code2).
print_number_with_padding(Number, StuffCharCode) :-
    digit_code(Number, Code1),
    put_code(Code1),
    put_code(StuffCharCode).


digit_code(0, 48).
digit_code(1, 49).
digit_code(2, 50).
digit_code(3, 51).
digit_code(4, 52).
digit_code(5, 53).
digit_code(6, 54).
digit_code(7, 55).
digit_code(8, 56).
digit_code(9, 57).

% 1 : White Ring : 9651 :
% 2 : Black Ring : 9650 :
% 3 : White Ball : 9675 :
% 4 : Black Ball : 9679 :
code(0, 32).
code(1, 9633).
code(2, 9632).
code(3, 9675).
code(4, 9679).


display_game(GameState, Player) :-
    nl,
    next_player(Player, PreviousPlayer),
    print_player(PreviousPlayer),
    nl,
    get_board(GameState, Board),
    get_shown_stack_size(GameState, ShownStackSize),
    print_board(Board, ShownStackSize),
    nl,
    get_white_rings(GameState, WhiteRings),
    write('Unplayed white rings:'),
    code(1, WhiteRingCode),
    print_remaining_pieces(WhiteRings, WhiteRingCode),
    get_black_rings(GameState, BlackRings),
    write('Unplayed black rings:'),
    code(2, BlackRingCode),
    print_remaining_pieces(BlackRings, BlackRingCode).

print_title :-
    nl,nl,
    write(' __  __ _ _                 _ '), nl,
    write('|  \\/  (_) |               | |'), nl,
    write('| \\  / |_| |_ ___ _   _  __| | ___  _ __ ___   ___   ___'), nl,
    write('| |\\/| | | __/ __| | | |/ _` |/ _ \\| \'_ ` _ \\ / _ \\ / _ \\'), nl,
    write('| |  | | | |_\\__ \\ |_| | (_| | (_) | | | | | | (_) |  __/'), nl,
    write('|_|  |_|_|\\__|___/\\__,_|\\__,_|\\___/|_| |_| |_|\\___/ \\___|'),
    nl,
    nl.

print_legend :-
    nl,
    write('  Legend (only shown once):'),
    nl,
    write('    White Ring  - '),
    code(1, Char),
    put_code(Char),
    nl,
    write('    Black Ring  - '),
    code(2, Char1),
    put_code(Char1),
    nl,
    write('    White Ball  - '),
    code(3, Char2),
    put_code(Char2),
    nl,
    write('    Black Ball  - '),
    code(4, Char3),
    put_code(Char3),
    nl,
    nl.


print_mode_select :-
    write('1 - Human vs Human'),
    nl,
    write('2 - Computer vs Human (Computer First)'),
    nl,
    write('3 - Human vs Computer (Human First)'),
    nl,
    write('4 - Computer vs Computer'),
    nl,
    write('Choose mode: ').

print_player(white) :-
    print_line_padding,
    write('WHITE\'S TURN:'), nl.
print_player(black) :-
    print_line_padding,
    write('BLACK\'S TURN:'), nl.

print_remaining_pieces(0, _) :- nl.
print_remaining_pieces(NumPieces, PieceCode) :-
    NextPieces is NumPieces - 1,
    put_char(' '),
    put_code(PieceCode),
    print_remaining_pieces(NextPieces, PieceCode).

print_top_letters([], _, _) :- nl.
print_top_letters([_ | Board], CharCode, CellWidth) :-
    HalfWidth is (CellWidth // 2) + 1,
    put_char_n_times(' ', HalfWidth),
    put_code(CharCode),
    put_char_n_times(' ', HalfWidth),
    NextCharCode is CharCode + 1,
    print_top_letters(Board, NextCharCode, CellWidth).


print_board(Board, ShownStackSize) :-
    % Nearest odd integer (2 -> 3, 3 -> 3)
    CellWidth is ((ShownStackSize // 2) * 2) + 3,
    print_line_padding,
    print_top_letters(Board, 65, CellWidth),  % 65 is 'a'
    print_board(Board, 0, ShownStackSize, CellWidth).


print_board([], _, _, _) :- nl.
print_board([Line | Board], LineNumber, ShownStackSize, CellWidth) :-
    print_line(Line, LineNumber, ShownStackSize, CellWidth),
    NextLineNumber is LineNumber + 1,
    print_board(Board, NextLineNumber, ShownStackSize, CellWidth).


print_line_padding :-
    put_char(' '),
    put_char(' '),
    put_char(' '),
    put_char(' ').


print_line_number(LineNumber) :-
    put_char(' '),
    print_number_with_padding(LineNumber, 32),  % 32 is code for ' '
    put_char(' ').


print_line(Line, LineNumber, ShownStackSize, CellWidth) :-
    print_line_padding,
    print_line_top(Line, CellWidth),
    print_line_mid(Line, LineNumber, ShownStackSize, CellWidth),
    print_line_padding,
    print_line_bot(Line, CellWidth).

% boundary(vert, 9474).
% boundary(hor, 9472).
% boundary(top_left, 9484).
% boundary(top_right, 9488).
% boundary(bot_left, 9492).
% boundary(bot_right, 9496).

print_line_top([], _) :- nl.
print_line_top([_ | Line], CellWidth) :-
    put_code(9484),
    put_code_n_times(9472, CellWidth),
    put_code(9488),
    print_line_top(Line, CellWidth).


print_line_bot([], _) :- nl.
print_line_bot([Stack | Line], CellWidth) :-
    put_code(9492),
    length(Stack, StackLength),
    print_number_with_padding(StackLength, 9472),
    CutCellWidth is CellWidth - 2,
    put_code_n_times(9472, CutCellWidth),
    put_code(9496),
    print_line_bot(Line, CellWidth).


print_left_padding(CurLevel, LineNumber, NumberOfLevels) :-
    CurLevel =:= NumberOfLevels // 2,
    print_line_number(LineNumber).
print_left_padding(_, _, _) :-
    print_line_padding.

print_line_mid(Line, LineNumber, NumberOfLevels, CellWidth) :-
    print_line_mid(Line, LineNumber, NumberOfLevels, 0, CellWidth).

print_line_mid(_, _, X, X, _).
print_line_mid(Line, LineNumber, NumberOfLevels, CurLevel, CellWidth) :-
    print_left_padding(CurLevel, LineNumber, NumberOfLevels),
    % ite(
    %     CurLevel =:= NumberOfLevels // 2,
    %     print_line_number(LineNumber),
    %     print_line_padding
    % ),
    print_line_mid_inner(Line, NumberOfLevels, CurLevel, CellWidth),
    nl,
    NextLevel is CurLevel + 1,
    print_line_mid(Line, LineNumber, NumberOfLevels, NextLevel, CellWidth).


print_line_mid_inner([], _, _, _).
print_line_mid_inner([Stack | Line], NumberOfLevels, Elem, CellWidth) :-
    put_code(9474),
    HalfWidth is CellWidth // 2,
    put_char_n_times(' ', HalfWidth),
    get_stuffed_elem_from_end0(Stack, Elem, NumberOfLevels, Result),
    code(Result, Char),
    put_code(Char),
    put_char_n_times(' ', HalfWidth),
    put_code(9474),
    print_line_mid_inner(Line, NumberOfLevels, Elem, CellWidth).


get_stuffed_elem_from_end0(Stack, Position, StuffLength, Result) :-
    length(Stack, Length),
    ite(
        Length < StuffLength,
        % Pos is  Length - Position + (StuffLength - Length), simplified below
        Pos is  StuffLength - Position,
        Pos is Length - Position
    ),
    ite((Pos =< Length, Pos > 0), nth1(Pos, Stack, Result), Result is 0).
