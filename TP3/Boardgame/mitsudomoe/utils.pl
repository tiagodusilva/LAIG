:- use_module(library(lists)).

% If then else
ite(I, T, _) :-
    I, !, T.
ite(_, _, E) :-
    E.


% replace(OldList, Index, ElemToReplace, NewList)
replace([_|T], 0, ElemToReplace, [ElemToReplace|T]).
replace([H|T1], Index, ElemToReplace, [H|T2]) :-
    Index > -1,
    NextIndex is Index - 1,
    replace(T1, NextIndex, ElemToReplace, T2).



% http://kti.ms.mff.cuni.cz/~bartak/prolog/combinatorics.html
% Generates a combination
comb(0,_,[]).
comb(N, [X|T],[X|Comb]):- N>0,N1 is N-1,comb(N1,T,Comb).
comb(N,[_|T],Comb):- N>0,comb(N,T,Comb).

% Using findall we can create a list with ALL valid combinations
combinations(N, Input, Output) :-
    findall(X, comb(N, Input, X), Output).

% Generates every combination except the one especified in +Except
combinations_except(N, Input, Except, Output) :-
    findall(X, (comb(N, Input, X), \+ are_lists_equal(X, Except)), Output).

% Checks if two lists are exactly equal (shallow)
are_lists_equal([], []).
are_lists_equal([H | T1], [H | T2]) :-
    are_lists_equal(T1, T2).

% Applies a predicate to every member of a list, converts it to a numeric value
% and selects in -Min the one that generates the lowest value
min_map(List, Predicate, Min) :-
    min_map(List, Predicate, Min, _, 99999).

min_map([], _, Min, Min, _).
min_map([H | List], Predicate, Min, CurBest, CurBestVal) :-
    append(Predicate, [H, Value], PredList),
    Pred =.. PredList,
    Pred,
    min_map_is_better(H, Value, CurBest, CurBestVal, NextBest, NextBestVal),
    min_map(List, Predicate, Min, NextBest, NextBestVal).

min_map_is_better(Cur, Value, _, CurBestVal, NextBest, NextBestVal) :-
    Value < CurBestVal,
    NextBest = Cur,
    NextBestVal is Value.
min_map_is_better(_, _, CurBest, CurBestVal, NextBest, NextBestVal) :-
    NextBest = CurBest,
    NextBestVal is CurBestVal.

% ------------------------
%   POSITION MANIPULATION
% ------------------------

% Sums two coords together (useful for coords + vector cases)
add_coords([X1, Y1], [X2, Y2], Result) :-
    Rx is X1 + X2,
    Ry is Y1 + Y2,
    Result = [Rx, Ry].

% Checks if two coords are different
is_pos_different([CoordsA, CoordsB]) :- is_pos_different(CoordsA, CoordsB).
is_pos_different([RowIndexA, _], [RowIndexB, _]) :-
    \+ RowIndexA is RowIndexB, !.
is_pos_different([_, ColIndexA], [_, ColIndexB]) :-
    \+ ColIndexA is ColIndexB, !.


% Adjacent is vertical horizontal or diagonal
is_adjacent([FromCoords, ToCoords]) :- is_adjacent(FromCoords, ToCoords).
is_adjacent([FromRowIndex, FromColIndex], [ToRowIndex, ToColIndex]) :-
    RowAdj is abs(FromRowIndex - ToRowIndex),
    ColAdj is abs(FromColIndex - ToColIndex),
    % Same cell
    (RowAdj + ColAdj) =\= 0,
    RowAdj =< 1,
    ColAdj =< 1.


% Returns a unitary "vector" given two cells
get_direction([[FromRowIndex, FromColIndex], [ToRowIndex, ToColIndex]], [DeltaRow, DeltaCol]) :-
    RowAdj is (ToRowIndex - FromRowIndex),
    ColAdj is (ToColIndex - FromColIndex),
    is_valid_direction(RowAdj, ColAdj),
    DeltaRow is sign(RowAdj),
    DeltaCol is sign(ColAdj).

% Checks if a vector is horizontal, vertical, or a 'pefect diagonal' (eg: [1, 1], [-3, 3])
is_valid_direction(RowAdj, ColAdj) :-
    % Checks perfect diagonal
    RowAdj =\= 0,
    ColAdj =\= 0,
    abs(RowAdj) =:= abs(ColAdj), !.
is_valid_direction(RowAdj, ColAdj) :-
    % Checks horizontal movement
    RowAdj =\= 0,
    ColAdj =:= 0, !.
is_valid_direction(RowAdj, ColAdj) :-
    % Checks vertical movement
    RowAdj =:= 0,
    ColAdj =\= 0, !.

% Gets the nth element from the end of a list
nth0_from_end(Index, List, Elem) :-
    reverse(List, RevList),
    nth0(Index, RevList, Elem).

% Calculates the euclidian distance between two points
dist([X1, Y1], [X2, Y2], Result) :-
    Result is sqrt(exp(X1 - X2, 2) + exp(Y1 - Y2, 2)).

% Calculates the average of a list
avg(List, Result) :-
    length(List, Len),
    sumlist(List, Sum),
    Result is Sum / Len.
