export enum Tokens{
    //Literals
    WORD,
    STRING,
    NUMBER,
    ASSIGNMENT,

    //Vars and Expansions
    VARIABLE,
    VARIABLE_BRACED,
    COMMAND_SUB,
    COMMAND_SUB_BACKTICK,
    ARITHMETIC,

    //Operators
    PIPE,
    PIPE_AND,
    AND,
    OR,
    NOT,
    SEMICOLON,
    DOUBLE_SEMICOLON,
    BACKGROUND,
    EOF,
    DOUBLE_OPEN_SQUARED, //[[
    DOUBLE_CLOSE_SQUARED, //]]
    COMMENT, //#
    

    //Redirectors
    REDIRECT_OUT,
    REDIRECT_APPEND,
    REDIRECT_IN,
    HEREDOC,
    HERESTRING,
    REDIRECT_ERR,
    REDIRECT_ERR_APPEND,
    REDIRECT_ALL,
    REDIRECT_ALL_APPEND,
    DUP_OUTPUT,
    DUP_INPUT,

    //Grouping
    OPEN_SUBSHELL,
    CLOSE_SUBSHELL,
    OPEN_COMMAND_GROUP,
    CLOSE_COMMAND_GROUP,

    //control flow
    IF,
    THEN,
    ELIF,
    ELSE,
    ENDIF,
    CASE,
    ENDCASE,
    IN,
    FOR,
    WHILE,
    UNTIL,
    DO,
    DONE,
    SELECT,

    //Funcs
    FUNCTION,
    RETURN,
    BREAK,
    CONTINUE,
    EXIT,

    //Modifiers
    EXPORT,
    LOCAL,
    READONLY,
    UNSET,
    DECLARE,
    SOURCE,
    ALIAS,
    UNALIAS,
    TIME,
    COPROC,

    UNKNOWN_TOKEN //i will use this for errors 
}