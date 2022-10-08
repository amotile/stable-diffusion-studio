import React from 'react';
import { render, screen } from '@testing-library/react';
import {merge} from "../features/prop-editors/prompt-parsing/merge";




test('hello pello', () => {
    let merged = merge("hello", "pello", [5, 10]).result;

    expect(merged).toEqual("{hello:0.5|pello:0.5}")
});

test('hello fire', () => {
    let merged = merge("hello {fire}", "hello {fire:2}", [5, 10]).result;

    expect(merged).toEqual("hello fire")
});


test('hello fire ice', () => {
    let merged = merge("hello {fire}", "hello {ice}", [5, 10]).result;

    expect(merged).toEqual("hello {fire:0.5|ice:0.5}")
});

test('hello fire | fire fire ice', () => {
    let merged = merge("hello {fire}", "hello {fire:4|fire:2|ice}", [5, 10]).result;

    expect(merged).toEqual("hello {fire:2.5|fire:1.0|ice:0.5}")
});

test('schedule simple', () => {
    let merged = merge("hello [from:to:10]", "hello [from:to:20]", [5, 10]).result;

    expect(merged).toEqual("hello [from:to:15]")
});

test('schedule blend', () => {
    let merged = merge("{hello [from:to:10]:1|hello [from:to:20]:0}", "{hello [from:to:10]:0|hello [from:to:20]:1}", [5, 10]).result;

    expect(merged).toEqual("{hello [from:to:10]:0.5|hello [from:to:20]:0.5}")
});