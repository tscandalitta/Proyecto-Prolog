:- module(proylcc,
	[
		emptyBoard/1,
		goMove/4,
		eliminar/3
	]).

	emptyBoard([
			 ["-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-"],
			 ["-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-"],
			 ["-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-"],
			 ["-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-"],
			 ["-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-"],
			 ["-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-"],
			 ["-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-"],
			 ["-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-"],
			 ["-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-"],
			 ["-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-"],
			 ["-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-"],
			 ["-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-"],
			 ["-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-"],
			 ["-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-"],
			 ["-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-"],
			 ["-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-"],
			 ["-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-"],
			 ["-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-"],
			 ["-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-"]
			 ]).


%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%
% goMove(+Board, +Player, +Pos, -RBoard)
%
% RBoard es la configuración resultante de reflejar la movida del jugador Player
% en la posición Pos a partir de la configuración Board.

goMove(Board, Player, [R,C], RBoard):-
    replace(Row, R, NRow, Board, RBoard), replace("-", C, Player, Row, NRow).

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%
% eliminar(+Board, +Pos, -RBoard)
%
% RBoard es la configuración resultante de eliminar la posicion Pos a partir
% de la configuración Board.

eliminar(Board, [R,C], RBoard):-
    replace(Row, R, NRow, Board, RBoard), replace(_, C, "-", Row, NRow).

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%
% replace(?X, +XIndex, +Y, +Xs, -XsY)
%

replace(X, 0, Y, [X|Xs], [Y|Xs]).

replace(X, XIndex, Y, [Xi|Xs], [Xi|XsY]):-
    XIndex > 0,
    XIndexS is XIndex - 1,
    replace(X, XIndexS, Y, Xs, XsY).


capturada(X):- capt(X,[]).

capt(X,L):- not(member(X,L)), L1=[X|L], getAdyacentes(X,LA), capt2(LA,L1).

capt2([],_).
capt2([X|XS],L):- capt(X,L), L1=[X|L], capt2(Xs,L1).





getAdyacentes([0,0],[[1,0],[0,1]]).
getAdyacentes([0,18],[[0,17],[1,18]]).
getAdyacentes([18,0],[[18,1],[17,0]]).
getAdyacentes([18,18],[[18,17],[17,18]]).
getAdyacentes([0,C],[[1,C],[0,C1],[0,C2]]):- C\=0, C1 is C-1, C2 is C+1.
getAdyacentes([18,C],[[17,C],[18,C1],[18,C2]]):- C\=18, C1 is C-1, C2 is C+1.
getAdyacentes([R,0],[[R,1],[R1,0],[R2,0]]):- R\=0, R1 is R-1, R2 is R+1.
getAdyacentes([R,18],[[R,17],[R1,18],[R2,18]]):- R\=18, R1 is R-1, R2 is R+1.
getAdyacentes([R,C],Adyacentes):-R\=0, C\=0,  R\=18, C\=18, R1 is R-1, R2 is R+1, C1 is C-1, C2 is C+1,
								Adyacentes=[[R1,C],[R2,C],[R,C1],[R,C2]].
