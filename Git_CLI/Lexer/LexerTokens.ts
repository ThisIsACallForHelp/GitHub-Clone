export enum Tokens {
    // Literals
    WORD, // "echo" | "my_file"
    STRING, // "hello" | 'hello'
    NUMBER, // 42
    ASSIGNMENT, // foo=bar

    // Vars and Expansions
    VARIABLE, // $PATH
    VARIABLE_BRACED, // ${PATH}
    COMMAND_SUB, // $(echo hi)
    COMMAND_SUB_BACKTICK, // `echo hi`
    ARITHMETIC, // $((2 + 3))

    // Operators
    PIPE, // "|"
    PIPE_AND, // "|&"
    AND, // "&&"
    OR, // "||"
    NOT, // "!"
    SEMICOLON, // ";"
    DOUBLE_SEMICOLON, // ";;"
    NEWLINE, // line break
    BACKGROUND, // "&"
    EOF, // end of input
    DOUBLE_OPEN_SQUARED, // "[["
    DOUBLE_CLOSE_SQUARED, // "]]"
    Ampersand, // "&"

    // Redirectors
    REDIRECT_OUT, // ">"
    REDIRECT_APPEND, // ">>"
    REDIRECT_IN, // "<"
    HEREDOC, // "<<"
    HERESTRING, // "<<<"
    REDIRECT_ERR, // "2>"
    REDIRECT_ERR_APPEND, // "2>>"
    REDIRECT_ALL, // "&>"
    REDIRECT_ALL_APPEND, // "&>>"
    DUP_OUTPUT, // ">&"
    DUP_INPUT, // "<&"

    // Grouping
    OPEN_SUBSHELL, // "("
    CLOSE_SUBSHELL, // ")"
    OPEN_COMMAND_GROUP, // "{"
    CLOSE_COMMAND_GROUP, // "}"

    // Control flow
    IF, // "if"
    THEN, // "then"
    ELIF, // "elif"
    ELSE, // "else"
    ENDIF, // "fi"
    CASE, // "case"
    ENDCASE, // "esac"
    IN, // "in"
    FOR, // "for"
    WHILE, // "while"
    UNTIL, // "until"
    DO, // "do"
    DONE, // "done"
    SELECT, // "select"

    // Functions
    FUNCTION, // "function"
    RETURN, // "return"
    BREAK, // "break"
    CONTINUE, // "continue"
    EXIT, // "exit"

    // Modifiers
    EXPORT, // "export"
    LOCAL, // "local"
    READONLY, // "readonly"
    UNSET, // "unset"
    DECLARE, // "declare"
    SOURCE, // "source"
    ALIAS, // "alias"
    UNALIAS, // "unalias"
    TIME, // "time"
    COPROC, // "coproc"

    UNKNOWN_TOKEN // invalid or unknown input
}