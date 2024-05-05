# Rock Paper Scissors Lizard Spock - RPSLS game

This is a brief exercise in which two players can play the RPSLS game via blockchain using the **Sepolia** test network.

The purpose of this project serves to test how to connect a frontend to the blockchain using a wallet. This project has been tested using MetaMask on Google Chrome and Brave, even though it should work on every other major browser given its simple UI.

Since the scope of this project purely pertains to the frontend, the "temptation" of using a centralized backend has been avoided. Therefore, most of the "complex" logic relays mostly on the blockchain and the browser localStorage of player 1 (i.e. the player who creates the game).

The game works fine by following the happy path described down below. Nevertheless, given the lack of a backend and the limited information that can be stored in [the smart contract in which this project is based on](https://github.com/clesaege/RPS/blob/master/RPS.sol), there are some edge cases and race conditions that could break the game or at least bring some unexpected behavior.

On the other hand, since this application fully relies on the blockchain, **there is not any limitation to the quantity of simultaneous games that can be held**.

Additionally, since this is just an exercise and not anything intended for production nor to showoff wizard-like frontend skills, for the sake of brevity during development the UI has been made quite simple on purpose.

## Game Structure

The game was made considering the following acceptance criteria:

<ol>
    <li>It should allow a party to create a RPS game;</li>
    <li>
        <p>The first party:</p>
        <ol>
            <li>Creates the game;</li>
            <li>Puts a commitment of his move;</li>
            <li>Selects the other player;</li>
            <li>Stakes some ETH;</li>
        </ol>
    </li>
    <li>
        <p>The second party:</p>
        <ol>
            <li>Pays the same amount of ETH;</li>
            <li>Chooses his move;</li>
        </ol>
    </li>
    <li>The first party reveals his move;</li>
    <li>The contract distributes the ETH to the winner or splits them in case of a tie;</li>
    <li>If some party stops responding there are some timeouts.</li>
</ol>

<br/>
With this in mind, the game has been split in four different phases:

<ol>
    <li>
        <p>Phase 1:</p>
        <ol>
            <li>Player 1 creates and starts the game;</li>
        </ol>
    </li>
    <li>
        <p>Phase 2:</p>
        <ol>
            <li>Player 2 makes his move;</li>
            <li>Player 1 waits for Player 2 to make his move. If Player 2 takes more than 5 minutes to play, Player 1 can cancel the game and recover the staked ETH (wei) that he bet;</li>
        </ol>
    </li>
    <li>
        <p>Phase 3:</p>
        <ol>
            <li>Player 1 solves the game;</li>
            <li>Player 2 waits for Player 1 to solve. If Player 1 takes more than 5 minutes to solve, Player 2 can end the game and automatically win the game;</li>
        </ol>
    </li>
    <li>
        <p>Phase 4:</p>
        <ol>
            <li>Player 1 and Player 2 can see if they won the game.</li>
        </ol>
    </li>
</ol>

## Happy Path

1. Both, Player 1 and Player 2 have to connect their wallet (MetaMask) to the app:
![image](https://github.com/Joaquin-M2/RPSLS/assets/61671655/5a57c323-4034-45b8-8dd6-4b471e731ba5)

2. Player 1 creates the game:
![image](https://github.com/Joaquin-M2/RPSLS/assets/61671655/5bdedbd9-0650-416e-b6d0-187aa9b78dd9)

3. Player 1 sets his bet (Wei), chooses his move, sets the account address of Player 2 and starts the game:
![image](https://github.com/Joaquin-M2/RPSLS/assets/61671655/ef7b99d0-542a-4fab-a6a5-3c64181c6f4e)

4. Player 1 copies and sends the game address to Player 2 using his preferred method of communication (e.g. email):
![image](https://github.com/Joaquin-M2/RPSLS/assets/61671655/85a1e812-3c42-4ede-a290-31496a477bb5)

5. Player 2 uses the address received from Player 1 to join the game:
![image](https://github.com/Joaquin-M2/RPSLS/assets/61671655/d0ba2fa5-dd87-40f8-8dd4-9a736b4bf102)

6. Player 2 makes his move and confirms he want to play by clicking on the "Play!" button:
![image](https://github.com/Joaquin-M2/RPSLS/assets/61671655/b83ac697-f481-4a72-b5e3-13a365f060fe)

7. Player 1 solves the game:
![image](https://github.com/Joaquin-M2/RPSLS/assets/61671655/0cbc80f4-84aa-45be-86e9-37b954200f15)

8. Players can see if they won the game:
![image](https://github.com/Joaquin-M2/RPSLS/assets/61671655/82b42c2b-22ff-4bb8-9b84-b35301c53dd0)


<p align="center">***** End of file *****</p>
